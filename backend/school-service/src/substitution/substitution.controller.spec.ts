import { Test, TestingModule } from '@nestjs/testing';
import { SubstitutionController } from './substitution.controller';

describe('SubstitutionController', () => {
  let controller: SubstitutionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubstitutionController],
    }).compile();

    controller = module.get<SubstitutionController>(SubstitutionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
