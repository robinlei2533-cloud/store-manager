$port = 5173
$root = "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend\dist"
$mime = @{".html"="text/html; charset=utf-8";".js"="application/javascript; charset=utf-8";".css"="text/css; charset=utf-8";".png"="image/png";".svg"="image/svg+xml";".json"="application/json";".ico"="image/x-icon"}
$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
$listener.Start()
Write-Host "Server running at http://localhost:$port - Press Ctrl+C to stop"
while($true) {
    try {
        $c = $listener.AcceptTcpClient()
        $s = $c.GetStream()
        $r = New-Object System.IO.StreamReader($s)
        $w = New-Object System.IO.StreamWriter($s)
        $req = $r.ReadLine()
        while($r.ReadLine() -ne ""){}
        if($req -match 'GET\s+/(\S*)\s+HTTP') {
            $p = $matches[1]
            if([string]::IsNullOrEmpty($p)){$p="index.html"}
            if(-not [System.IO.Path]::HasExtension($p)){$p="index.html"}
            $f = Join-Path $root $p
            if(Test-Path $f -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($f).ToLower()
                $ct = if($mime.ContainsKey($ext)){$mime[$ext]}else{"application/octet-stream"}
                $b = [System.IO.File]::ReadAllBytes($f)
                $w.WriteLine("HTTP/1.1 200 OK");$w.WriteLine("Content-Type: $ct");$w.WriteLine("Content-Length: $($b.Length)");$w.WriteLine("Connection: close");$w.WriteLine();$w.Flush();$s.Write($b,0,$b.Length)
            } else {
                $f = Join-Path $root "index.html"
                $b = [System.IO.File]::ReadAllBytes($f)
                $w.WriteLine("HTTP/1.1 200 OK");$w.WriteLine("Content-Type: text/html; charset=utf-8");$w.WriteLine("Content-Length: $($b.Length)");$w.WriteLine("Connection: close");$w.WriteLine();$w.Flush();$s.Write($b,0,$b.Length)
            }
        }
        $s.Close();$c.Close()
    } catch { }
}

