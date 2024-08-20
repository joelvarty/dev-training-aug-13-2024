import {getPageTemplate} from "components/agility-pages"
import {PageProps, getAgilityPage} from "lib/cms/getAgilityPage"
import {getAgilityContext} from "lib/cms/useAgilityContext"

import {Metadata, ResolvingMetadata} from "next"

import {resolveAgilityMetaData} from "lib/cms-content/resolveAgilityMetaData"
import NotFound from "./not-found"
import InlineError from "components/common/InlineError"
import {cacheConfig} from "lib/cms/cacheConfig"
import {ContentItem} from "@agility/content-fetch"

export const revalidate = cacheConfig.pathRevalidateDuration
// export const runtime = "nodejs"
// export const dynamic = "force-static"

/**
 * Generate metadata for this page
 */
export async function generateMetadata(
	{params, searchParams}: PageProps,
	parent: ResolvingMetadata
): Promise<Metadata> {
	// read route params
	const {locale, sitemap, isDevelopmentMode, isPreview} = getAgilityContext()

	const agilityData = await getAgilityPage({params})

	if (!agilityData.page) return {}
	return await resolveAgilityMetaData({agilityData, locale, sitemap, isDevelopmentMode, isPreview, parent})
}

export default async function Page(props: any) {
	const {params, searchParams}: PageProps = props

	const agilityData = await getAgilityPage({params})
	agilityData.globalData = agilityData.globalData || {}
	agilityData.globalData = {...agilityData.globalData, searchParams}

	//if the page is not found...
	if (!agilityData.page) return NotFound()

	const AgilityPageTemplate = getPageTemplate(agilityData.pageTemplateName || "")

	const dymamicPageItem = agilityData.dynamicPageItem as ContentItem<any> | undefined
	/**
	 * Determin any json-ld schema data for this page
	 * https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld
	 */
	let structData: any = null

	if (dymamicPageItem?.properties.definitionName === "Post") {
		structData = {
			"@context": "https://schema.org",
			"@type": "NewsArticle",
			mainEntityOfPage: {
				"@type": "WebPage",
				"@id": "https://google.com/article",
			},
			headline: dymamicPageItem.fields.title,
			datePublished: dymamicPageItem.fields.date,
			dateModified: dymamicPageItem.fields.date,

			publisher: {
				"@type": "Organization",
				name: "Agility CMS",
				logo: {
					"@type": "ImageObject",
					url: "https://static.agilitycms.com/brand/logo_combined_yellow_gray.png",
				},
			},
			image: [],
		}
		if (dymamicPageItem.fields.image) {
			structData.image = [dymamicPageItem.fields.image.url]
		}
	}

	return (
		<div data-agility-page={agilityData.page?.pageID} data-agility-dynamic-content={agilityData.sitemapNode.contentID}>
			{structData && (
				<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structData)}} />
			)}
			{AgilityPageTemplate && <AgilityPageTemplate {...agilityData} />}
			{!AgilityPageTemplate && (
				// if we don't have a template for this page, show an error
				<InlineError message={`No template found for page template name: ${agilityData.pageTemplateName}`} />
			)}
		</div>
	)
}
