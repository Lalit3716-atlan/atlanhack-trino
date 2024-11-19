import asyncio
import logging
import threading
from contextlib import asynccontextmanager

import uvicorn
from application_sdk.app.rest import FastAPIApplicationBuilder
from application_sdk.workflows.resources.temporal_resource import (
    TemporalConfig,
    TemporalResource,
)
from application_sdk.workflows.sql.controllers.auth import SQLWorkflowAuthController
from application_sdk.workflows.sql.resources.sql_resource import (
    SQLResource,
    SQLResourceConfig,
)
from application_sdk.workflows.sql.workflows.workflow import SQLWorkflow
from application_sdk.workflows.workers.worker import WorkflowWorker
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.workflow import (
    PostgresWorkflowBuilder,
    PostgresWorkflowMetadata,
    PostgresWorkflowPreflight,
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


@asynccontextmanager
async def lifespan(app: FastAPI):
    atlan_app_builder.on_api_service_start()

    worker: WorkflowWorker = WorkflowWorker(
        temporal_resource=temporal_resource,
        temporal_activities=postgres_workflow.get_activities(),
        workflow_class=SQLWorkflow,
    )

    worker_thread = threading.Thread(
        target=lambda: asyncio.run(worker.start()), daemon=True
    )
    worker_thread.start()
    yield


app = FastAPI(title="Postgres App", lifespan=lifespan)

APPLICATION_NAME = "postgres"

if __name__ == "__main__":
    sql_resource = SQLResource(
        SQLResourceConfig(
            database_dialect="postgresql",
            database_driver="psycopg2",
        )
    )
    temporal_resource = TemporalResource(
        TemporalConfig(
            application_name=APPLICATION_NAME,
        )
    )
    asyncio.run(temporal_resource.load())

    postgres_workflow: SQLWorkflow = (
        PostgresWorkflowBuilder()
        .set_sql_resource(sql_resource=sql_resource)
        .set_temporal_resource(temporal_resource=temporal_resource)
        .build()
    )

    atlan_app_builder = FastAPIApplicationBuilder(
        app=app,
        resource=sql_resource,
        workflow=postgres_workflow,
        preflight_check_controller=PostgresWorkflowPreflight(sql_resource=sql_resource),
        metadata_controller=PostgresWorkflowMetadata(sql_resource=sql_resource),
        auth_controller=SQLWorkflowAuthController(sql_resource=sql_resource),
    )
    atlan_app_builder.add_telemetry_routes()
    atlan_app_builder.add_workflows_router()

    # always mount the frontend at the end
    app.mount("/", StaticFiles(directory="frontend", html=True), name="static")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
    )

    # atlan_app_builder.configure_open_telemetry()
