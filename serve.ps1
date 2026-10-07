$root = 'C:\Users\dsied\Documents\[PERSO]\SITE CV'
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add('http://localhost:8790/')
$l.Start()
$types = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css'; '.js'='application/javascript'; '.jpg'='image/jpeg'; '.png'='image/png'; '.pdf'='application/pdf' }
while ($l.IsListening) {
  $c = $l.GetContext()
  $p = [uri]::UnescapeDataString($c.Request.Url.AbsolutePath).TrimStart('/')
  if ($p -eq '') { $p = 'index.html' }
  $f = Join-Path $root $p
  if (Test-Path -LiteralPath $f -PathType Leaf) {
    $b = [IO.File]::ReadAllBytes($f)
    $c.Response.ContentType = $types[[IO.Path]::GetExtension($f)]
    $c.Response.Headers.Add("Cache-Control","no-store")
    $c.Response.OutputStream.Write($b, 0, $b.Length)
  } else { $c.Response.StatusCode = 404 }
  $c.Response.Close()
}
