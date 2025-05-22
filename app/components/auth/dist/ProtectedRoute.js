'use client';
"use strict";
exports.__esModule = true;
var AuthContext_1 = require("@/lib/auth/AuthContext");
var navigation_1 = require("next/navigation"); // Updated imports
var react_1 = require("react");
function ProtectedRoute(_a) {
    var children = _a.children;
    var _b = AuthContext_1.useAuth(), user = _b.user, loading = _b.loading;
    var router = navigation_1.useRouter();
    var pathname = navigation_1.usePathname(); // Get current pathname
    var searchParams = navigation_1.useSearchParams(); // Get current search params
    react_1.useEffect(function () {
        if (!loading && !user) {
            // Construct the redirectTo URL correctly
            var currentPath = pathname + (searchParams.toString() ? "?" + searchParams.toString() : '');
            router.push("/login?redirectTo=" + encodeURIComponent(currentPath));
        }
    }, [loading, user, router, pathname, searchParams]);
    if (loading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
            React.createElement("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" })));
    }
    return user ? React.createElement(React.Fragment, null, children) : null;
}
exports["default"] = ProtectedRoute;
