import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { IntelligenceGraphService } from './intelligence-graph.service';
import { AIClientService } from './ai-client.service';
import { IntelligenceGraphController } from './intelligence-graph.controller';
import { 
  Student, 
  StudentLearningProfile,
  Skill,
  Concept,
  StudentSkillMastery,
  StudentConceptMastery,
  TopicSkillMap,
  TopicConceptMap,
  SyllabusTopic,
  StudentMarks,
  HomeworkSubmission,
  StudentAttendance
} from '@lumiqos/shared';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      StudentLearningProfile,
      Skill,
      Concept,
      StudentSkillMastery,
      StudentConceptMastery,
      TopicSkillMap,
      TopicConceptMap,
      SyllabusTopic,
      StudentMarks,
      HomeworkSubmission,
      StudentAttendance
    ]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [IntelligenceGraphController],
  providers: [IntelligenceGraphService, AIClientService],
  exports: [IntelligenceGraphService, AIClientService]
})
export class IntelligenceGraphModule {}
