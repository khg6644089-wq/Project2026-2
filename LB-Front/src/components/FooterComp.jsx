import { Link, useLocation } from 'react-router-dom';

function FooterComp() {
  return (
    <footer className="bg-deep text-white py-8 md:py-12">
      <div className="containers">
        <div className="flex flex-col md:justify-between gap-4">
          {/* 로고 */}
          <Link
            to="/"
            className="block hover:opacity-80 transition-opacity duration-300 w-fit"
          >
            <img
              src="https://fvdyqzogufeurojwjqwt.supabase.co/storage/v1/object/sign/logo/logoWhite.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMDY3OTY1My1jNzIxLTRlMGMtYmY2Yy1iZWUwZjBhM2EyMWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL2xvZ29XaGl0ZS5wbmciLCJpYXQiOjE3Njk0MTIyNTUsImV4cCI6MTgwMDk0ODI1NX0.VEGFXR9_CaI9NVfuEm0RyGAfxinCIscReN7J6P0111Y"
              alt="logo"
              className="h-10 w-auto"
            />
          </Link>

          {/* 설명 */}
          <p className="text-white text-xs" style={{ fontWeight: 100 }}>
            COPYRIGHTⓒ 2025.Last Layer Last Balance. INC. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default FooterComp;
