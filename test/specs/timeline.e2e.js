import { expect } from '@wdio/globals'

import HomePage from '../page-objects/home.page.js'
import SearchPage from 'page-objects/search.page.js'
import SearchResultsPage from '../page-objects/searchResultsPage.js'
import TimelinePage from '../page-objects/timeline.page.js'
import { sendCdsMessageFromFile } from '../utils/soapMessageHandler.js'
import { sendIpaffMessageFromFile } from '../utils/ipaffsMessageHandler.js'
import { processorPostMatchedGmrFromFile } from '../utils/processorClient.js'
import {
  generateMrn,
  generateGmr,
  generateChed,
  generateCorrelationId
} from '../utils/id-generator.js'

describe('Timeline Search', () => {
  const mrn = generateMrn()
  let ched
  const correlationId = generateCorrelationId()

  const dropdownMrn = generateMrn()
  const dropdownMrn2 = generateMrn()
  const dropdownMrn3 = generateMrn()
  const dropdownGmr = generateGmr()
  let dropdownChed

  before(async () => {
    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    ched = await generateChed()
    dropdownChed = await generateChed()
    await sendCdsMessageFromFile('../data/timeline/1-cr-btms-error.xml', {
      mrn,
      correlationId
    })
    await pause(2000)
    await sendCdsMessageFromFile('../data/timeline/2-cr.xml', {
      mrn,
      ched,
      correlationId: generateCorrelationId()
    })
    await pause(2000)
    await sendIpaffMessageFromFile('../data/timeline/3-ched-valid.json', {
      ched
    })
    await pause(2000)
    await sendCdsMessageFromFile(
      '../data/timeline/4-released-final.xml',
      { mrn, correlationId: generateCorrelationId() },
      true
    )
    await pause(2000)
    await sendCdsMessageFromFile(
      '../data/timeline/5-cr-cds-error.xml',
      { mrn, correlationId: generateCorrelationId() },
      false,
      true
    )
    await pause(2000)
    await sendIpaffMessageFromFile('../data/timeline/6-ched-valid.json', {
      ched
    })
    await pause(2000)

    await sendCdsMessageFromFile('../data/gmr/clearance-gmr.xml', {
      mrn: dropdownMrn,
      ched: dropdownChed,
      correlationId: generateCorrelationId()
    })
    await sendCdsMessageFromFile('../data/gmr/clearance-gmr-1.xml', {
      mrn: dropdownMrn2,
      ched: dropdownChed,
      correlationId: generateCorrelationId()
    })
    await sendCdsMessageFromFile('../data/gmr/clearance-gmr-2.xml', {
      mrn: dropdownMrn3,
      ched: dropdownChed,
      correlationId: generateCorrelationId()
    })
    await sendIpaffMessageFromFile('../data/gmr/ipaff-gmr.json', {
      ched: dropdownChed
    })
    await processorPostMatchedGmrFromFile('../data/gmr/gmr.json', {
      gmrId: dropdownGmr,
      customs: [dropdownMrn],
      transits: [generateMrn()]
    })
    await pause(2000)

    await HomePage.open()
    if (!(await SearchPage.sessionActive())) {
      await HomePage.login()
      await HomePage.gatewayLogin()
      await HomePage.loginRegisteredUser()
    }
  })

  it('Should be able to search for a Valid MRN that has CDS Decision, BTMS Decision, CHED, CDS Finalisation, BTMS Error, and CDS Error', async () => {
    await SearchPage.clickNavSearchLink()
    await SearchPage.search(mrn)
    expect(await SearchResultsPage.getResultText()).toContain(mrn)

    await TimelinePage.clickTimelineTab()
    expect(await TimelinePage.getTimelineInfoMessage()).toContain(
      'The timeline includes events from the past 180 days only.'
    )

    const timelineTexts = await TimelinePage.allTimelineText(mrn)

    const expectedOrderForCdsDecision = [
      'CDS clearance request',
      'CDS to BTMS',
      'External version',
      '3',
      'Created'
    ]

    const expectedOrderForChed = [
      ched,
      'IPAFFS to BTMS',
      'CHED status',
      'VALIDATED',
      'Decision',
      'Horse Re-entry',
      'Created'
    ]

    const expectedOrderForCdsFinalisation = [
      'CDS finalisation',
      'CDS to BTMS',
      'CDS status',
      'Finalised - Released',
      'Version',
      '3',
      'Created'
    ]

    const expectedOrderForBtmsTrader = [
      'BTMS decision',
      'BTMS to CDS',
      'CDS status',
      'In progress - Awaiting trader',
      'Decision number',
      '1',
      'External version',
      '3',
      'Created'
    ]

    const expectedOrderForBtmsCds = [
      'BTMS decision',
      'BTMS to CDS',
      'CDS status',
      'In progress - Awaiting CDS',
      'Decision number',
      '2',
      'External version',
      '3',
      'Created'
    ]

    const expectedOrderForBtmsError = [
      'BTMS processing error',
      'BTMS to CDS',
      'Error',
      'ALVSVAL318',
      'Message',
      `Item 1 has no document code. BTMS requires at least one item document. Your request with correlation ID ${correlationId} has been terminated.`,
      'Created'
    ]

    const expectedOrderForCdsError = [
      'CDS processing error',
      'CDS to BTMS',
      'Error',
      'HMRCVAL101',
      'Message',
      'The EntryReference was not recognised. HMRC is unable to process the decision notification {{TICKET}}{{ITERATION}}.',
      'Created'
    ]

    expectConsecutiveSubsequence(timelineTexts, expectedOrderForCdsDecision)
    expectConsecutiveSubsequence(timelineTexts, expectedOrderForChed)
    expectConsecutiveSubsequence(timelineTexts, expectedOrderForCdsFinalisation)
    expectConsecutiveSubsequence(timelineTexts, expectedOrderForBtmsTrader)
    expectConsecutiveSubsequence(timelineTexts, expectedOrderForBtmsCds)
    expectConsecutiveSubsequence(timelineTexts, expectedOrderForBtmsError)
    expectConsecutiveSubsequence(timelineTexts, expectedOrderForCdsError)

    await expect(await TimelinePage.isTimelineMrnDropdownVisible()).toBe(false)
  })

  it('Should be able to search for a Valid MRN that has MRN dropdown', async () => {
    await SearchPage.clickNavSearchLink()
    await SearchPage.search(dropdownMrn)
    expect(await SearchResultsPage.getResultText()).toContain(dropdownMrn)

    await TimelinePage.clickTimelineTab()
    expect(await TimelinePage.getTimelineInfoMessage()).toContain(
      'The timeline includes events from the past 180 days only.'
    )
    await expect(await TimelinePage.isTimelineMrnDropdownVisible()).toBe(true)

    await TimelinePage.selectDropdownAndClickVisibleMoreDetails(dropdownMrn)
    const timelineTexts = await TimelinePage.allTimelineText(dropdownMrn)

    const expectedTextForFirstMrn = [
      `Item 1 - SALSICCIA PURO SUINO ${dropdownMrn}`
    ]
    expectConsecutiveSubsequence(timelineTexts, expectedTextForFirstMrn)
  })
})

function expectConsecutiveSubsequence(arr, subseq) {
  for (let i = 0; i <= arr.length - subseq.length; i++) {
    let match = true
    for (let j = 0; j < subseq.length; j++) {
      if (arr[i + j] !== subseq[j]) {
        match = false
        break
      }
    }
    if (match) return
  }
  throw new Error(
    `Expected consecutive sequence not found.\nExpected: ${JSON.stringify(subseq)}\nActual: ${JSON.stringify(arr)}`
  )
}
