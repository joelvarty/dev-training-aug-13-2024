import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDynamicPageURL } from "@agility/nextjs/node"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {




	/*****************************
	 * *** AGILITY MIDDLEWARE ***
	 * 1: Check if this is a preview request,
	 * 2: Check if we are exiting preview
	 * 3: Check if this is a direct to a dynamic page
	 *    based on a content id
	 *******************************/
	const previewQ = request.nextUrl.searchParams.get("AgilityPreview")
	let contentIDStr = request.nextUrl.searchParams.get("ContentID") as string || ""

	if (request.nextUrl.searchParams.has("agilitypreviewkey")) {
		//*** this is a preview request ***
		const agilityPreviewKey = request.nextUrl.searchParams.get("agilitypreviewkey") || ""

		//locale is also passed in the querystring on preview requests
		const locale = request.nextUrl.searchParams.get("lang")
		const slug = request.nextUrl.pathname

		console.log("redirect to preview mode", { agilityPreviewKey, locale, slug })

		//valid preview key: we need to redirect to the correct url for preview
		let redirectUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/api/preview?locale=${locale}&contentID=${contentIDStr}&slug=${encodeURIComponent(slug)}&agilitypreviewkey=${encodeURIComponent(agilityPreviewKey)}`

		return NextResponse.rewrite(redirectUrl)

	} else if (previewQ === "0") {
		//*** exit preview
		const locale = request.nextUrl.searchParams.get("lang")

		//we need to redirect to the correct url for preview
		const slug = request.nextUrl.pathname
		let redirectUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}/api/preview/exit?locale=${locale}&slug=${encodeURIComponent(slug)}`

		return NextResponse.redirect(redirectUrl)
	} else if (contentIDStr) {
		const contentID = parseInt(contentIDStr)
		if (!isNaN(contentID) && contentID > 0) {
			//*** this is a dynamic page request ***

			//get the slug for this page based on the sitemap and redirect there
			const redirectUrl = await getDynamicPageURL({ contentID, preview: true, slug: "" })
			if (redirectUrl) {
				return NextResponse.redirect(redirectUrl)
			}
		}
	} else {


		//if we are NOT redirecting, we can continue with the request and check for locale

		//derive the locale from eithet the HOST name, the path or the lang querystring
		const host = request.nextUrl.host

		//IF YOU ARE DOING HOST BASED LOCALE MAPPING (locale.mysite.com)
		let locale: string | null = null
		//TODO: determine the host to locale mapping

		//ALSO check the querystring for the language code (Agility adds this when you click preview)
		if (request.nextUrl.searchParams.has("lang")) {
			locale = request.nextUrl.searchParams.get("lang") as string
		}

		//if we have a locale, set the header
		if (locale) {
			const response = NextResponse.next();
			response.headers.set('x-locale', 'fr');
			return response
		}

		//IF WE ARE DOING PATH BASED 
	}





}


export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - static assets (assets folder)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|assets/|favicon.ico).*)",

	]
}
