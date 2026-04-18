import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntelligenceGraphService } from './intelligence-graph.service';
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
  AcademicPlan,
  AcademicPlanItem
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
      AcademicPlan,
      AcademicPlanItem
    ])
  ],
  controllers: [IntelligenceGraphController],
  providers: [IntelligenceGraphService],
  exports: [IntelligenceGraphService]
})
export class IntelligenceGraphModule {}
