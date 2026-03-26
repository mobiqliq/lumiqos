import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlannedSchedule, ScheduleStatus } from '@lumiqos/shared/src/entities/planned-schedule.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { Section } from '@lumiqos/shared/src/entities/section.entity';

export interface ParityAlert {
    class_id: string;
    class_name: string;
    subject_id: string;
    subject_name: string;
    leading_section_name: string;
    lagging_section_name: string;
    topic_gap: number;
    recommendation: string;
}

@Injectable()
export class ParityAuditorService {
    private readonly logger = new Logger(ParityAuditorService.name);

    constructor(
        @InjectRepository(PlannedSchedule) private readonly scheduleRepo: Repository<PlannedSchedule>,
        @InjectRepository(Class) private readonly classRepo: Repository<Class>,
        @InjectRepository(Subject) private readonly subjectRepo: Repository<Subject>,
        @InjectRepository(Section) private readonly sectionRepo: Repository<Section>,
    ) {}

    async getParityAudit(schoolId: string, yearId: string): Promise<ParityAlert[]> {
        // Find all past schedules
        const todayDate = new Date().toISOString().split('T')[0];
        
        // This query fetches the count of COMPLETED/SCHEDULED classes per section
        const schedules = await this.scheduleRepo.find({
            where: { school_id: schoolId, academic_year_id: yearId }
        });

        // Group by Class -> Subject -> Section -> Completed Count
        const tracking: Record<string, Record<string, Record<string, number>>> = {};

        for (const s of schedules) {
            if (!s.section_id) continue;
            
            const cId = s.class_id;
            const subId = s.subject_id;
            const secId = s.section_id;

            if (!tracking[cId]) tracking[cId] = {};
            if (!tracking[cId][subId]) tracking[cId][subId] = {};
            if (!tracking[cId][subId][secId]) tracking[cId][subId][secId] = 0;

            if (s.status === ScheduleStatus.COMPLETED || s.planned_date < todayDate) { // Rough approximation if status isn't perfectly updated
                 tracking[cId][subId][secId]++;
            }
        }

        const alerts: ParityAlert[] = [];

        // Analyze Parity
        for (const [classId, subjects] of Object.entries(tracking)) {
            for (const [subjectId, sections] of Object.entries(subjects)) {
                
                const sectionEntries = Object.entries(sections);
                // We only care if there are >= 2 sections to compare
                if (sectionEntries.length < 2) continue;

                // Sort sections by completed classes (descending)
                sectionEntries.sort((a, b) => b[1] - a[1]);

                const leadingSectionId = sectionEntries[0][0];
                const leadingCount = sectionEntries[0][1];

                const laggingSectionId = sectionEntries[sectionEntries.length - 1][0];
                const laggingCount = sectionEntries[sectionEntries.length - 1][1];

                const topicGap = leadingCount - laggingCount;

                if (topicGap > 3) {
                    // Fetch metadata
                    const classEntity = await this.classRepo.findOne({ where: { id: classId }});
                    const subjectEntity = await this.subjectRepo.findOne({ where: { id: subjectId }});
                    const leadSecEntity = await this.sectionRepo.findOne({ where: { id: leadingSectionId }});
                    const lagSecEntity = await this.sectionRepo.findOne({ where: { id: laggingSectionId }});

                    const className = classEntity?.name || classEntity?.class_name || 'Class';
                    const subjectName = subjectEntity?.name || subjectEntity?.subject_name || 'Subject';
                    const leadName = leadSecEntity?.name || leadSecEntity?.section_name || 'Section A';
                    const lagName = lagSecEntity?.name || lagSecEntity?.section_name || 'Section B';

                    alerts.push({
                        class_id: classId,
                        class_name: className,
                        subject_id: subjectId,
                        subject_name: subjectName,
                        leading_section_name: leadName,
                        lagging_section_name: lagName,
                        topic_gap: topicGap,
                        recommendation: `In ${className} ${subjectName}, ${leadName} is ${topicGap} classes ahead of ${lagName}. Suggest moving 1 period from ${leadName} to ${lagName} next week to bring them back into sync before the Mid-Terms.`
                    });
                }
            }
        }

        return alerts;
    }
}
