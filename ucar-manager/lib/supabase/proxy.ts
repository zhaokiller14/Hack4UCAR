import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getRoleHomePath, isAppRole, isInstitutionRole, type AppRole } from "@/lib/auth/roles";
import { hasEnvVars } from "../utils";

type UserRow = {
  role: string | null;
};

function roleFromMetadata(metadata: Record<string, unknown> | undefined): AppRole | null {
  const role = metadata?.role;
  return isAppRole(role) ? role : null;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getUser() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/auth");
  const isUcarRoute = pathname.startsWith("/ucar");
  const isInstitutionRoute = pathname.startsWith("/institution");
  const restrictedInstitutionUcarPrefixes = [
    "/ucar/academic",
    "/ucar/employment",
    "/ucar/finance",
    "/ucar/hr",
    "/ucar/research",
    "/ucar/esg",
    "/ucar/infrastructure",
    "/ucar/partnerships",
  ];
  const isRestrictedInstitutionUcarRoute = restrictedInstitutionUcarPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!user) {
    if (isUcarRoute || isInstitutionRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<UserRow>();

  const role = isAppRole(userRow?.role)
    ? userRow?.role
    : roleFromMetadata(user.app_metadata as Record<string, unknown> | undefined);
  const roleHomePath = getRoleHomePath(role);

  if (
    isAuthRoute &&
    (pathname === "/auth/login" || pathname === "/auth/sign-up") &&
    roleHomePath
  ) {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath;
    return NextResponse.redirect(url);
  }

  if (isRestrictedInstitutionUcarRoute && role === "super_admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/forbidden";
    return NextResponse.redirect(url);
  }

  if (isRestrictedInstitutionUcarRoute && !isInstitutionRole(role)) {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath ?? "/auth/login";
    return NextResponse.redirect(url);
  }

  if (isUcarRoute && role !== "super_admin") {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath ?? "/auth/login";
    return NextResponse.redirect(url);
  }

  if (isInstitutionRoute && !isInstitutionRole(role)) {
    const url = request.nextUrl.clone();
    url.pathname = roleHomePath ?? "/auth/login";
    return NextResponse.redirect(url);
  }

  const isSuperAdminPath = pathname.startsWith("/super-admin");
  const isAdminPath = pathname.startsWith("/admin");

  if (user && (isSuperAdminPath || isAdminPath)) {
    let operatorRole: string | null = null;

    const userId = user?.id; // Depending on how your Supabase auth is set up, the user ID might be in `sub` or `id`

    if (userId) {
      const { data: usersRow } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      operatorRole = usersRow?.role ?? null;

      if (!operatorRole) {
        const { data: profilesRow } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        operatorRole = profilesRow?.role ?? null;
      }
    }

    if (
      (isSuperAdminPath && operatorRole !== "super_admin") ||
      (isAdminPath && operatorRole !== "org_admin")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/forbidden";
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
