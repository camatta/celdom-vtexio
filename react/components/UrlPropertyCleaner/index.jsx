import { useEffect } from 'react'

const PROPERTY_QUERY_PREFIX = 'property__'
const LINK_SELECTOR = 'a[href*="property__"]'

let activeInstances = 0
let observer = null
let cleanupScheduled = false
let originalPushState = null
let originalReplaceState = null

const getCleanUrl = (urlValue) => {
  const url = new URL(urlValue, window.location.origin)
  let changed = false

  Array.from(url.searchParams.keys()).forEach((key) => {
    if (!key.startsWith(PROPERTY_QUERY_PREFIX)) return

    url.searchParams.delete(key)
    changed = true
  })

  return { url, changed }
}

const getRelativeUrl = (url) => `${url.pathname}${url.search}${url.hash}`

const getCleanHistoryUrl = (urlValue) => {
  if (!urlValue) return urlValue

  try {
    const { url, changed } = getCleanUrl(urlValue)

    if (!changed || url.origin !== window.location.origin) return urlValue

    return getRelativeUrl(url)
  } catch {
    return urlValue
  }
}

const cleanCurrentUrl = () => {
  if (!originalReplaceState) return

  try {
    const { url, changed } = getCleanUrl(window.location.href)

    if (!changed) return

    originalReplaceState.call(
      window.history,
      window.history.state,
      document.title,
      getRelativeUrl(url)
    )
  } catch {
    // Keep navigation untouched if the browser rejects URL parsing.
  }
}

const cleanLinks = () => {
  document.querySelectorAll(LINK_SELECTOR).forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) return

    try {
      const { url, changed } = getCleanUrl(link.href)

      if (!changed || url.origin !== window.location.origin) return

      link.href = getRelativeUrl(url)
    } catch {
      // Ignore malformed href values.
    }
  })
}

const runCleanup = () => {
  cleanCurrentUrl()
  cleanLinks()
}

const scheduleCleanup = () => {
  if (cleanupScheduled) return

  cleanupScheduled = true

  window.requestAnimationFrame(() => {
    cleanupScheduled = false
    runCleanup()
  })
}

const startUrlPropertyCleaner = () => {
  activeInstances += 1

  if (activeInstances > 1) {
    scheduleCleanup()
    return
  }

  originalPushState = window.history.pushState
  originalReplaceState = window.history.replaceState

  window.history.pushState = function pushStateWithoutPropertyParams(state, title, url) {
    return originalPushState.call(this, state, title, getCleanHistoryUrl(url))
  }

  window.history.replaceState = function replaceStateWithoutPropertyParams(
    state,
    title,
    url
  ) {
    return originalReplaceState.call(this, state, title, getCleanHistoryUrl(url))
  }

  observer = new MutationObserver(scheduleCleanup)
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['href'],
    childList: true,
    subtree: true,
  })

  window.addEventListener('popstate', scheduleCleanup)
  scheduleCleanup()
}

const stopUrlPropertyCleaner = () => {
  activeInstances = Math.max(0, activeInstances - 1)

  if (activeInstances > 0) return

  if (observer) {
    observer.disconnect()
    observer = null
  }

  window.removeEventListener('popstate', scheduleCleanup)

  if (originalPushState) {
    window.history.pushState = originalPushState
    originalPushState = null
  }

  if (originalReplaceState) {
    window.history.replaceState = originalReplaceState
    originalReplaceState = null
  }
}

const UrlPropertyCleaner = () => {
  useEffect(() => {
    startUrlPropertyCleaner()

    return stopUrlPropertyCleaner
  }, [])

  return null
}

export default UrlPropertyCleaner
