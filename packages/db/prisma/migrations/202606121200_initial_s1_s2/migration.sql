CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'demo',
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "workspaces" (
  "id" TEXT NOT NULL,
  "owner_user_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "mode" TEXT NOT NULL DEFAULT 'demo',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
  "id" TEXT NOT NULL,
  "workspace_id" TEXT NOT NULL,
  "owner_user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "current_stage" TEXT NOT NULL DEFAULT 'chat',
  "settings" JSONB NOT NULL DEFAULT '{}',
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "episodes" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "script_version" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "episodes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "script_drafts" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "episode_id" TEXT,
  "version" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'user',
  "locked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "script_drafts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scenes" (
  "id" TEXT NOT NULL,
  "episode_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "location_asset_id" TEXT,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "scenes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shots" (
  "id" TEXT NOT NULL,
  "scene_id" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "camera_json" JSONB NOT NULL DEFAULT '{}',
  "emotion" TEXT,
  "duration" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "shots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "canvas_documents" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "nodes_json" JSONB NOT NULL DEFAULT '[]',
  "edges_json" JSONB NOT NULL DEFAULT '[]',
  "viewport_json" JSONB NOT NULL DEFAULT '{}',
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "canvas_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_threads" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "mode" TEXT NOT NULL DEFAULT 'demo',
  "status" TEXT NOT NULL DEFAULT 'active',
  "focus_type" TEXT NOT NULL DEFAULT 'Project',
  "focus_id" TEXT,
  "summary" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "agent_threads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_messages" (
  "id" TEXT NOT NULL,
  "thread_id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "model_meta_json" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "agent_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_events" (
  "id" TEXT NOT NULL,
  "thread_id" TEXT NOT NULL,
  "task_id" TEXT,
  "event_type" TEXT NOT NULL,
  "actor" TEXT NOT NULL,
  "payload_json" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "agent_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "workspaces_owner_user_id_idx" ON "workspaces"("owner_user_id");
CREATE UNIQUE INDEX "projects_route_key" ON "projects"("route");
CREATE INDEX "projects_workspace_id_updated_at_idx" ON "projects"("workspace_id", "updated_at");
CREATE INDEX "projects_owner_user_id_idx" ON "projects"("owner_user_id");
CREATE INDEX "episodes_project_id_idx" ON "episodes"("project_id");
CREATE UNIQUE INDEX "episodes_project_id_order_key" ON "episodes"("project_id", "order");
CREATE INDEX "script_drafts_episode_id_idx" ON "script_drafts"("episode_id");
CREATE UNIQUE INDEX "script_drafts_project_id_version_key" ON "script_drafts"("project_id", "version");
CREATE INDEX "scenes_episode_id_order_idx" ON "scenes"("episode_id", "order");
CREATE UNIQUE INDEX "scenes_episode_id_order_key" ON "scenes"("episode_id", "order");
CREATE INDEX "shots_scene_id_order_idx" ON "shots"("scene_id", "order");
CREATE UNIQUE INDEX "shots_scene_id_order_key" ON "shots"("scene_id", "order");
CREATE UNIQUE INDEX "canvas_documents_project_id_key" ON "canvas_documents"("project_id");
CREATE INDEX "agent_threads_project_id_idx" ON "agent_threads"("project_id");
CREATE INDEX "agent_messages_thread_id_idx" ON "agent_messages"("thread_id");
CREATE INDEX "agent_events_thread_id_created_at_idx" ON "agent_events"("thread_id", "created_at");

ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "script_drafts" ADD CONSTRAINT "script_drafts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "script_drafts" ADD CONSTRAINT "script_drafts_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shots" ADD CONSTRAINT "shots_scene_id_fkey" FOREIGN KEY ("scene_id") REFERENCES "scenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "canvas_documents" ADD CONSTRAINT "canvas_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "agent_threads" ADD CONSTRAINT "agent_threads_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "agent_messages" ADD CONSTRAINT "agent_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "agent_threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "agent_events" ADD CONSTRAINT "agent_events_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "agent_threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
