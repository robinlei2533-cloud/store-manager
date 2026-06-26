$port = 5173
$root = "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend\dist"
$mime = @{".html"="text/html; charset=utf-8";".js"="application/javascript; charset=utf-8";".css"="text/css; charset=utf-8";".png"="image/png";".svg"="image/svg+xml";".json"="application/json";".ico"="image/x-icon"}
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
$listener.Start()
Write-Host "`n======================================"
Write-Host "  UWELL CRM 网站已启动!"
Write-Host "  访问地址: http://localhost:$port"
Write-Host "  按 Ctrl+C 停止服务器"
Write-Host "======================================`n"
while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $writer = New-Object System.IO.StreamWriter($stream)
        $req = $reader.ReadLine()
        while ($reader.ReadLine() -ne "") {}
        if ($req -match "GET\s+/(\S*)\s+HTTP") {
            $p = $matches[1]
            if ([string]::IsNullOrEmpty($p)) { $p = "index.html" }
            if (-not [System.IO.Path]::HasExtension($p)) { $p = "index.html" }
            $f = Join-Path $root $p
            if (Test-Path $f -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($f).ToLower()
                $ct = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
                $b = [System.IO.File]::ReadAllBytes($f)
                $writer.WriteLine("HTTP/1.1 200 OK");$writer.WriteLine("Content-Type: $ct");$writer.WriteLine("Content-Length: $($b.Length)");$writer.WriteLine("Connection: close");$writer.WriteLine();$writer.Flush();$stream.Write($b,0,$b.Length)
                Write-Host "  OK $p"
            } else {
                $f = Join-Path $root "index.html"
                $b = [System.IO.File]::ReadAllBytes($f)
                $writer.WriteLine("HTTP/1.1 200 OK");$writer.WriteLine("Content-Type: text/html; charset=utf-8");$writer.WriteLine("Content-Length: $($b.Length)");$writer.WriteLine("Connection: close");$writer.WriteLine();$writer.Flush();$stream.Write($b,0,$b.Length)
            }
        }
        $stream.Close();$client.Close()
    } catch {}
}
