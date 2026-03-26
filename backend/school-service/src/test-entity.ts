import { LessonPlan } from '@lumiqos/shared/src/entities/lesson-plan.entity';
console.log('File resolved to:', require.resolve('@lumiqos/shared/src/entities/lesson-plan.entity'));
console.log('LessonPlan properties:', Object.getOwnPropertyNames(new LessonPlan()));
