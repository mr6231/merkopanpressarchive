document.addEventListener("DOMContentLoaded", () => {
  const tabsContainer = document.getElementById("tabs-container")
  const articlesDisplayArea = document.getElementById("articles-display-area")
  const searchInput = document.getElementById("search-input")

  let allNewspapers = [] // Store all fetched newspapers

  function createArticleElement(newspaper) {
    const articleDiv = document.createElement("div")
    articleDiv.classList.add("newspaper-article")

    const titleElement = document.createElement("h3")
    titleElement.textContent = newspaper.title

    const dateElement = document.createElement("span")
    dateElement.classList.add("date")
    dateElement.textContent = newspaper.date

    const contentElement = document.createElement("div")
    contentElement.classList.add("content")
    contentElement.innerHTML = newspaper.content.replace(/\n/g, "<br>")

    articleDiv.appendChild(titleElement)
    articleDiv.appendChild(dateElement)
    articleDiv.appendChild(contentElement)

    return articleDiv
  }

  function createSourceSections(newspapers) {
    articlesDisplayArea.innerHTML = "" // Clear loading message or previous content

    // Group newspapers by source
    const newspapersBySource = newspapers.reduce((acc, newspaper) => {
      if (!acc[newspaper.source]) {
        acc[newspaper.source] = []
      }
      acc[newspaper.source].push(newspaper)
      return acc
    }, {})

    // Create a section for each source
    for (const source in newspapersBySource) {
      const sourceSection = document.createElement("div")
      sourceSection.classList.add("source-section")
      sourceSection.dataset.source = source // Store the source name

      const sourceTitle = document.createElement("h2")
      sourceTitle.classList.add("source-title")
      sourceTitle.textContent = source
      sourceSection.appendChild(sourceTitle)

      newspapersBySource[source].forEach((newspaper) => {
        sourceSection.appendChild(createArticleElement(newspaper))
      })
      articlesDisplayArea.appendChild(sourceSection)
    }
  }

  function applySearchFilter() {
    const searchTerm = searchInput.value.toLowerCase().trim()

    // Determine which source sections are currently active/visible
    const activeSections = document.querySelectorAll(".source-section.active")

    activeSections.forEach((section) => {
      const articles = section.querySelectorAll(".newspaper-article")
      let hasVisibleArticles = false

      articles.forEach((article) => {
        const title = article.querySelector("h3").textContent.toLowerCase()
        const content = article.querySelector(".content").textContent.toLowerCase()

        if (title.includes(searchTerm) || content.includes(searchTerm)) {
          article.style.display = "block" // Show the article
          hasVisibleArticles = true
        } else {
          article.style.display = "none" // Hide the article
        }
      })

      // Add/remove a "no results" message for the current section if needed
      let noResultsMessage = section.querySelector(".no-search-results")
      if (!hasVisibleArticles && searchTerm !== "") {
        if (!noResultsMessage) {
          noResultsMessage = document.createElement("p")
          noResultsMessage.classList.add("loading-message", "no-search-results")
          noResultsMessage.textContent = `No articles found matching "${searchTerm}" in this source.`
          section.appendChild(noResultsMessage)
        } else {
          noResultsMessage.textContent = `No articles found matching "${searchTerm}" in this source.`
        }
      } else {
        if (noResultsMessage) {
          noResultsMessage.remove()
        }
      }
    })
  }

  function createTabs(newspapers) {
    tabsContainer.innerHTML = "" // Clear existing tabs

    // Get unique sources
    const sources = ["All", ...new Set(newspapers.map((n) => n.source))]

    sources.forEach((source) => {
      const button = document.createElement("button")
      button.classList.add("tab-button")
      button.textContent = source
      button.dataset.source = source // Store the source name in a data attribute

      button.addEventListener("click", () => {
        // Remove 'active' class from all buttons
        document.querySelectorAll(".tab-button").forEach((btn) => {
          btn.classList.remove("active")
        })
        // Add 'active' class to the clicked button
        button.classList.add("active")

        // Hide all source sections
        document.querySelectorAll(".source-section").forEach((section) => {
          section.classList.remove("active")
        })

        // Show the relevant source section(s)
        if (source === "All") {
          document.querySelectorAll(".source-section").forEach((section) => {
            section.classList.add("active")
          })
        } else {
          const targetSection = document.querySelector(`.source-section[data-source="${source}"]`)
          if (targetSection) {
            targetSection.classList.add("active")
          }
        }
        // After changing tabs, re-apply the current search filter
        applySearchFilter()
      })
      tabsContainer.appendChild(button)
    })

    // Automatically click the "All" tab on initial load
    const allTabButton = tabsContainer.querySelector('.tab-button[data-source="All"]')
    if (allTabButton) {
      allTabButton.click()
    }
  }

  fetch("news.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
    .then((newspapers) => {
      allNewspapers = newspapers // Store all newspapers
      createSourceSections(allNewspapers) // Create the individual scrollable sections
      createTabs(allNewspapers) // Create tabs based on sources

      if (newspapers.length === 0) {
        articlesDisplayArea.innerHTML = '<p class="loading-message">No newspapers found.</p>'
      }
    })
    .catch((error) => {
      console.error("Error fetching newspapers:", error)
      articlesDisplayArea.innerHTML = `<p class="loading-message">Failed to load newspapers. Error: ${error.message}</p>`
    })

  // Add event listener for search input
  searchInput.addEventListener("input", applySearchFilter)
})


