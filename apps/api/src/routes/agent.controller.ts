import { Body, Controller, Get, Param, Post, Res } from "@nestjs/common";
import type { Response } from "express";
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

  @Post("threads/:threadId/messages/stream")
  async streamThreadMessage(
    @Param("threadId") threadId: string,
    @Body() body: CreateAgentMessageRequest,
    @Res() res: Response
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    try {
      for await (const event of this.events.streamThreadMessage(threadId, body)) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    } catch (error) {
      res.write(`data: ${JSON.stringify({ type: "error", message: error instanceof Error ? error.message : "stream failed" })}\n\n`);
    } finally {
      res.end();
    }
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
