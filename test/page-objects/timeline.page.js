import { Page } from './page.js'

class TimelinePage extends Page {
  open() {
    return super.open('/search')
  }

  get timelineContainer() {
    return $('.moj-timeline.btms-search-result-timeline')
  }

  get latestTab() {
    return $('#tab_latest-view')
  }

  get timelineInfoMessage() {
    return $('.btms-timelines .govuk-inset-text')
  }

  get timelineTab() {
    return $('#tab_timeline-view')
  }

  get timelineMrnDropdown() {
    return $('#timelineMrn')
  }

  mrnTimeline(mrn) {
    return $(`div.mrn-timeline[data-timeline_ref="${mrn}"]`)
  }

  async clickLatestTab() {
    await this.latestTab.click()
  }

  async clickTimelineTab() {
    await this.timelineTab.click()
  }

  async getTimelineInfoMessage() {
    return await this.getTextFrom(this.timelineInfoMessage)
  }

  async allTimelineText(mrn) {
    await this.elementIsDisplayed(this.mrnTimeline(mrn))
    const elements = await this.timelineContainer.$$('*')
    let texts = []
    for (const el of elements) {
      const txt = await el.getText()
      if (txt && txt.trim()) {
        texts.push(txt.trim())
      }
    }
    texts = texts.filter((t) => !t.includes('\n'))
    return texts
  }

  async isTimelineMrnDropdownVisible() {
    return await this.timelineMrnDropdown.isDisplayed()
  }

  async selectDropdownAndClickVisibleMoreDetails(value) {
    await this.timelineMrnDropdown.selectByVisibleText(value)
    const links = await $$(
      'details.govuk-details summary.govuk-details__summary'
    )
    for (const link of links) {
      if (await link.isDisplayed()) {
        await link.click()
        break
      }
    }
  }
}

export default new TimelinePage()
