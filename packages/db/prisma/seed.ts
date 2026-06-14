import { PrismaClient } from "@prisma/client";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_NAME,
  DEMO_WORKSPACE_NAME
} from "@actnow/shared";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: DEMO_USER_NAME
    }
  });

  await prisma.workspace.upsert({
    where: { id: "demo-workspace" },
    update: {},
    create: {
      id: "demo-workspace",
      ownerUserId: user.id,
      name: DEMO_WORKSPACE_NAME
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
