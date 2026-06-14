import { Module } from "@nestjs/common";
import { AgentController } from "../routes/agent.controller.js";
import { HealthController } from "../routes/health.controller.js";
import { ProjectsController } from "../routes/projects.controller.js";
import { AgentRegistryService } from "../services/agent-registry.service.js";
import { AgentEventsService } from "../services/agent-events.service.js";
import { DemoUserService } from "../services/demo-user.service.js";
import { MultiAgentOrchestratorService } from "../services/multi-agent-orchestrator.service.js";
import { PrismaService } from "../services/prisma.service.js";
import { ProjectsService } from "../services/projects.service.js";
import { TextModelService } from "../services/text-model.service.js";

@Module({
  controllers: [HealthController, ProjectsController, AgentController],
  providers: [
    PrismaService,
    DemoUserService,
    ProjectsService,
    AgentRegistryService,
    AgentEventsService,
    TextModelService,
    MultiAgentOrchestratorService
  ]
})
export class AppModule {}
