Add-Type -AssemblyName System.Drawing

$sourcePath = [System.IO.Path]::GetFullPath("public\asashs-logo.png")
$srcImg = [System.Drawing.Image]::FromFile($sourcePath)

# Densities and sizes
$densities = @{
    "mipmap-mdpi"    = @{ size = 48;  adaptiveSize = 108 }
    "mipmap-hdpi"    = @{ size = 72;  adaptiveSize = 162 }
    "mipmap-xhdpi"   = @{ size = 96;  adaptiveSize = 216 }
    "mipmap-xxhdpi"  = @{ size = 144; adaptiveSize = 324 }
    "mipmap-xxxhdpi" = @{ size = 192; adaptiveSize = 432 }
}

foreach ($key in $densities.Keys) {
    $dir = "android\app\src\main\res\$key"
    $size = $densities[$key].size
    $adpSize = $densities[$key].adaptiveSize

    # 1. ic_launcher.png (square/legacy with white background and 68% centered logo)
    $bmp1 = [System.Drawing.Bitmap]::new($size, $size)
    $g1 = [System.Drawing.Graphics]::FromImage($bmp1)
    $g1.Clear([System.Drawing.Color]::White)
    $g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $logoW1 = [int]($size * 0.68)
    $offset1 = [int](($size - $logoW1) / 2)
    $g1.DrawImage($srcImg, $offset1, $offset1, $logoW1, $logoW1)
    $g1.Dispose()
    $bmp1.Save("$dir\ic_launcher.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp1.Dispose()

    # 2. ic_launcher_round.png (white background and 62% centered logo so rounded mask fits easily)
    $bmp2 = [System.Drawing.Bitmap]::new($size, $size)
    $g2 = [System.Drawing.Graphics]::FromImage($bmp2)
    $g2.Clear([System.Drawing.Color]::White)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $logoW2 = [int]($size * 0.62)
    $offset2 = [int](($size - $logoW2) / 2)
    $g2.DrawImage($srcImg, $offset2, $offset2, $logoW2, $logoW2)
    $g2.Dispose()
    $bmp2.Save("$dir\ic_launcher_round.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp2.Dispose()

    # 3. ic_launcher_foreground.png (adaptive icon: transparent background and 58% centered logo inside safe zone!)
    $bmp3 = [System.Drawing.Bitmap]::new($adpSize, $adpSize)
    $g3 = [System.Drawing.Graphics]::FromImage($bmp3)
    $g3.Clear([System.Drawing.Color]::Transparent)
    $g3.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $logoW3 = [int]($adpSize * 0.58)
    $offset3 = [int](($adpSize - $logoW3) / 2)
    $g3.DrawImage($srcImg, $offset3, $offset3, $logoW3, $logoW3)
    $g3.Dispose()
    $bmp3.Save("$dir\ic_launcher_foreground.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp3.Dispose()
}

$srcImg.Dispose()
Write-Host "Launcher icons successfully padded and generated!"
