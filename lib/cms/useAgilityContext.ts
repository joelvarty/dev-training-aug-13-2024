import { draftMode, headers } from 'next/headers'
import { agilityConfig } from "@agility/nextjs"

/**
 * Gets the Agility context for the current request.
 */
export const getAgilityContext = () => {

	//determine if we're in preview mode based on "draft" mode from next.js
	const { isEnabled } = draftMode()

	const isDevelopmentMode = process.env.NODE_ENV === "development"
	//todo: determine the locale....

	//determine whether it's preview or dev mode
	const isPreview = isEnabled || isDevelopmentMode

	//the locale should be set in middleware...
	const locale = (headers().get("x-locale") as string) || "en-us"


	return {
		locales: agilityConfig.locales,
		locale,
		sitemap: agilityConfig.channelName,
		isPreview,
		isDevelopmentMode
	}
}

export const useAgilityContext = () => {
	return getAgilityContext()
}
