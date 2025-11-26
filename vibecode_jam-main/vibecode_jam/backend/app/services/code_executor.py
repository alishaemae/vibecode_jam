import docker
from tempfile import TemporaryDirectory
from pathlib import Path
from app.config import settings

client = docker.from_env()

def run_code(code: str, language: str):
    image_map = {
        "python": "python:3.11-alpine",
        "javascript": "node:20-alpine",
    }

    if language not in image_map:
        return {"stdout": "", "stderr": f"Language {language} not supported", "tests_passed": 0}

    image = image_map[language]

    with TemporaryDirectory() as tmpdir:
        code_file = Path(tmpdir) / f"main.{ 'py' if language=='python' else 'js' }"
        code_file.write_text(code)

        try:
            container = client.containers.run(
                image=image,
                command=f"timeout {settings.DOCKER_TIMEOUT}s {'python' if language=='python' else 'node'} {code_file.name}",
                volumes={tmpdir: {"bind": "/code", "mode": "ro"}},
                working_dir="/code",
                network_disabled=True,
                detach=False,
                remove=True,
                stdout=True,
                stderr=True,
                mem_limit=settings.DOCKER_MEM_LIMIT,
                cpu_period=100000,
                cpu_quota=settings.DOCKER_CPU_QUOTA
            )
            return {"stdout": container.decode(), "stderr": "", "tests_passed": 0}
        except Exception as e:
            return {"stdout": "", "stderr": str(e), "tests_passed": 0}
