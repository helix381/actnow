import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import type {
  CreateProjectRequest,
  LockScriptRequest,
  SaveCanvasRequest
} from "@actnow/shared";
import { ProjectsService } from "../services/projects.service.js";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  listProjects() {
    return this.projects.listProjects();
  }

  @Post()
  createProject(@Body() body: CreateProjectRequest) {
    return this.projects.createProject(body);
  }

  @Get(":projectId/workspace")
  getWorkspace(@Param("projectId") projectId: string) {
    return this.projects.getWorkspace(projectId);
  }

  @Post(":projectId/script/lock")
  lockScript(
    @Param("projectId") projectId: string,
    @Body() body: LockScriptRequest
  ) {
    return this.projects.lockScript(projectId, body);
  }

  @Put(":projectId/canvas")
  saveCanvas(
    @Param("projectId") projectId: string,
    @Body() body: SaveCanvasRequest
  ) {
    return this.projects.saveCanvas(projectId, body);
  }
}
