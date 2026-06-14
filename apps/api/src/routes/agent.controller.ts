import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { CreateAgentMessageRequest } from "@actnow/shared";
import { AgentEventsService } from "../services/agent-events.service.js";

@Controller("agent")
export class AgentController {
  constructor(private readonly events: AgentEventsService) {}

  @Post("threads/:threadId/messages")
  createThreadMessage(
    @Param("threadId") threadId: string,
    @Body() body: CreateAgentMessageRequest
  ) {
    return this.events.createThreadMessage(threadId, body);
  }

  @Get("threads/:threadId/events")
  listThreadEvents(@Param("threadId") threadId: string) {
    return this.events.listThreadEvents(threadId);
  }

  @Post("approvals/:approvalId/confirm")
  confirmApproval(@Param("approvalId") approvalId: string) {
    return this.events.confirmApproval(approvalId);
  }

  @Post("approvals/:approvalId/reject")
  rejectApproval(@Param("approvalId") approvalId: string) {
    return this.events.rejectApproval(approvalId);
  }
}
