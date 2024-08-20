import {getSitemapFlat} from "lib/cms/getSitemapFlat"
import {MetadataRoute} from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	//get the flat sitemap from Agility CMS and output it
	const sitemap = await getSitemapFlat({
		channelName: process.env.AGILITY_SITEMAP || "website",
		languageCode: process.env.AGILITY_LOCALES || "en-ca",
	})

	return Object.keys(sitemap).map((path, index) => {
		return {
			url: index === 0 ? "/" : path,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		}
	})
}
