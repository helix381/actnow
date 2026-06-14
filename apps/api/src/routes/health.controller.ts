import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service.js";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  health() {
    return {
      ok: true,
      service: "api",
      timestamp: new Date().toISOString()
    };
  }

  @Get("dependencies")
  async dependencies() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      ok: true,
      dependencies: {
        postgres: "ok"
      },
      timestamp: new Date().toISOString()
    };
  }
}
