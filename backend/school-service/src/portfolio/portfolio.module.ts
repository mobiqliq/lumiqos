import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PortfolioController } from "./portfolio.controller";
import { PortfolioService } from "./portfolio.service";
import { JwtStrategy } from "@xceliqos/shared/src/strategies/jwt.strategy";
import { Portfolio } from "@xceliqos/shared/src/entities/portfolio.entity";
import { PortfolioItem } from "@xceliqos/shared/src/entities/portfolio-item.entity";
import { PortfolioConfig } from "@xceliqos/shared/src/entities/portfolio-config.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Portfolio,
      PortfolioItem,
      PortfolioConfig,
    ]),
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService, JwtStrategy],
  exports: [PortfolioService],
})
export class PortfolioModule {}
