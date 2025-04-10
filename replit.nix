{pkgs}: {
  deps = [
    pkgs.nodePackages.prettier
    pkgs.tesseract
    pkgs.zlib
    pkgs.tk
    pkgs.tcl
    pkgs.libxcrypt
    pkgs.libwebp
    pkgs.libtiff
    pkgs.libjpeg
    pkgs.libimagequant
    pkgs.lcms2
    pkgs.xcbuild
    pkgs.swig
    pkgs.openjpeg
    pkgs.mupdf
    pkgs.libjpeg_turbo
    pkgs.jbig2dec
    pkgs.harfbuzz
    pkgs.gumbo
    pkgs.glibcLocales
    pkgs.freetype
    pkgs.pandoc
    pkgs.postgresql
  ];
}
