import asyncio
from websockets.asyncio.server import serve
import socket
import json
from time import sleep

async def run_server(port):
    async def handle_message(ws):
        async for message in ws:
            data = json.loads(message)
            console_ip = data['ip']
            console_port = data['port']
            data = retrieve_dump(console_ip, console_port)
            await ws.send(data)

    print(f"Starting server on port {port}")
    async with serve(handle_message, "0.0.0.0", port) as server:
        try:
            await server.serve_forever()
        except KeyboardInterrupt:
            print("Server stopped.")


def retrieve_dump(console_ip, console_port):
    print(f"Connecting to {console_ip}:{console_port}")
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect((console_ip, console_port))
    buffer = bytearray()
    SIZE = 0x44810
    while len(buffer) < SIZE:
        data = client_socket.recv(SIZE - len(buffer))
        print(f"Received {len(data)} bytes")
        if not data:
            sleep(0.01)
            continue
        buffer += data
    client_socket.close()
    print(f"Receive complete ({len(buffer)} bytes total)")
    return buffer

if __name__ == "__main__":
    asyncio.run(run_server(5000))
