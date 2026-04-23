import { LessonPlan } from '@xceliqos/shared/src/entities/lesson-plan.entity';
console.log('File resolved to:', require.resolve('@xceliqos/shared/src/entities/lesson-plan.entity'));
console.log('LessonPlan properties:', Object.getOwnPropertyNames(new LessonPlan()));
