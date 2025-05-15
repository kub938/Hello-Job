import os
from typing import Any
import logging
from openai import AsyncOpenAI
from agents import Agent, OpenAIChatCompletionsModel, FileSearchTool
from agents.mcp import MCPServerStdio

logger = logging.getLogger(__name__)

class GMSUtils:
    """GMS 유틸리티 클래스"""
    def __init__(self):
        self.GMS_KEY = os.getenv("GMS_KEY")
        self.GMS_API_BASE = os.getenv("GMS_API_BASE")

    async def _get_gms_client(self):
        """GMS 클라이언트 반환"""
        if not self.GMS_KEY or not self.GMS_API_BASE:
            raise ValueError("GMS_KEY or GMS_API_BASE is not set")

        return AsyncOpenAI(api_key=self.GMS_KEY, base_url=self.GMS_API_BASE)

    async def _get_gms_model(self, model: str="gpt-4.1"):
        """GMS 모델 반환"""
        GMS_CLIENT = await self._get_gms_client()

        GMS_MODEL = OpenAIChatCompletionsModel(
            model=model,
            openai_client=GMS_CLIENT
        )

        return GMS_MODEL
    
    async def _get_mcp_server_config(self, server_list: str|list[str]='all'):
        """MCP 서버 설정 반환"""
        import json
        import os
        from typing import List, Any
        from agents.mcp import MCPServerStdio
        
        mcp_config = None
        with open('app/services/mcp.json', 'r') as f:
                mcp_config = json.load(f)
        if server_list == 'all':
            logger.info("MCP 서버 설정 반환: all")
            
            return mcp_config.get('mcpServers', {}).items()
        else:
            logger.info(f"server_list type: {type(server_list)}")
            logger.info(f"MCP 서버 설정 반환: {server_list}")
            config = {}
            for server_name, server_config in mcp_config.get('mcpServers', {}).items():
                if server_name in server_list:
                    config[server_name] = server_config
            return config
        
    async def _set_mcp_server(self, server_list: list[str]):
        """MCP 서버 설정 및 연결
        
        Args:
            server_list: 연결할 MCP 서버 이름 목록
        
        Returns:
            List[MCPServerStdio]: 연결된 MCP 서버 목록
        """
        
        import os
        
        mcp_config = await self._get_mcp_server_config(server_list=server_list)
        servers = []
        
        for server_name, server_config in mcp_config.items():
            try:
                # 환경 변수 설정
                env_vars = server_config.get("env", {}).copy()
                
                # 모든 환경 변수를 .env 파일에서 로드
                if "env" in server_config:
                    for key in list(env_vars.keys()):
                        # .env 파일에서 환경 변수 가져오기
                        env_value = os.getenv(key)
                        if env_value:
                            env_vars[key] = env_value
                        else:
                            logger.warning(f"경고: {key} 환경 변수가 .env 파일에 설정되지 않았습니다.")
                
                mcp_server = MCPServerStdio(
                    name=server_name,
                    params={
                        "command": server_config.get("command"),
                        "args": server_config.get("args", []),
                        "env": env_vars
                    },
                    client_session_timeout_seconds=60,
                    cache_tools_list=True
                )
                logger.info(f"MCP 서버 연결 시도: {server_name}")
                logger.info(f"명령어: {server_config.get('command')}")
                logger.info(f"인자: {server_config.get('args', [])}")
                
                await mcp_server.connect()
                servers.append(mcp_server)
            except FileNotFoundError as e:
                logger.error(f"MCP 서버 {server_name} 연결 중 파일을 찾을 수 없음: {e}")
                logger.error(f"찾을 수 없는 파일 경로: {server_config.get('command')} 또는 {server_config.get('args', [])}")
                raise
            except Exception as e:
                logger.error(f"MCP 서버 {server_name} 연결 중 오류 발생: {e}")
                import traceback
                traceback.print_exc()
                raise
                
        return servers

    async def get_gms_agent(self, 
                            name: str="GMS Agent", 
                            model: str="gpt-4.1",
                            output_type: type[Any]=None,
                            mcp_servers: list[str]=None,
                            tools: list=None,
                            instructions: str="You are a helpful assistant that can answer questions and help with tasks."):
        """GMS 에이전트 반환"""
        GMS_MODEL = await self._get_gms_model(model)
        
        # MCP 서버 연결 (mcp_servers 파라미터가 전달된 경우)
        servers = []
        if mcp_servers:
            servers = await self._set_mcp_server(mcp_servers)
        
        # tools 파라미터가 None인 경우에만 기본 도구 추가
        agent_tools = tools if tools is not None else [
            FileSearchTool(
                max_num_results=5,
                vector_store_ids=["vs_6823f56f8c388191b0ce5387ed6d8110"]
            )
        ]
        
        agent = Agent(
            name=name,
            model=GMS_MODEL,
            instructions=instructions,
            output_type=output_type,
            mcp_servers=servers,
            tools=agent_tools
        )
        
        logger.info(f"agent: {agent}")
        logger.info(f"agent.mcp_servers: {agent.mcp_servers}")
        logger.info(f"agent.tools: {agent.tools}")

        return agent
gms_utils = GMSUtils()