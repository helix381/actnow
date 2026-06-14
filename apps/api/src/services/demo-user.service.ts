import { Injectable } from "@nestjs/common";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_NAME,
  DEMO_WORKSPACE_NAME
} from "@actnow/shared";
import { PrismaService } from "./prisma.service.js";

@Injectable()
export class DemoUserService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveDemoUser() {
    const user = await this.prisma.user.upsert({
      where: { email: DEMO_USER_EMAIL },
      update: {},
      create: {
        email: DEMO_USER_EMAIL,
        name: DEMO_USER_NAME
      }
    });

    const workspace =
      (await this.prisma.workspace.findFirst({
        where: { ownerUserId: user.id, mode: "demo" },
        orderBy: { createdAt: "asc" }
      })) ??
      (await this.prisma.workspace.create({
        data: {
          ownerUserId: user.id,
          name: DEMO_WORKSPACE_NAME
        }
      }));

    return { user, workspace };
  }
}
