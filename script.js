document.addEventListener("DOMContentLoaded", () => {
  const tabsContainer = document.getElementById("tabs-container");
  const articlesDisplayArea = document.getElementById("articles-display-area");
  const searchInput = document.getElementById("search-input");

  let allNewspapers = [];

  function createArticleElement(newspaper) {
    const articleDiv = document.createElement("div");
    articleDiv.classList.add("newspaper-article");

    const titleElement = document.createElement("h3");
    titleElement.textContent = newspaper.title;

    const dateElement = document.createElement("span");
    dateElement.classList.add("date");
    dateElement.textContent = newspaper.date;

    const contentElement = document.createElement("div");
    contentElement.classList.add("content");
    contentElement.innerHTML = newspaper.content.replace(/\n/g, "<br>");

    articleDiv.appendChild(titleElement);
    articleDiv.appendChild(dateElement);
    articleDiv.appendChild(contentElement);

    return articleDiv;
  }

  function createSourceSections(newspapers) {
    articlesDisplayArea.innerHTML = "";

    const newspapersBySource = newspapers.reduce((acc, newspaper) => {
      if (!acc[newspaper.source]) {
        acc[newspaper.source] = [];
      }
      acc[newspaper.source].push(newspaper);
      return acc;
    }, {});

    for (const source in newspapersBySource) {
      const section = document.createElement("div");
      section.classList.add("source-section");
      section.dataset.source = source;
      section.style.display = "none"; // Hide by default

      const sourceTitle = document.createElement("h2");
      sourceTitle.classList.add("source-title");
      sourceTitle.textContent = source;
      section.appendChild(sourceTitle);

      newspapersBySource[source].forEach((newspaper) => {
        section.appendChild(createArticleElement(newspaper));
      });

      articlesDisplayArea.appendChild(section);
    }
  }

  function applySearchFilter() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    const activeSections = document.querySelectorAll(".source-section.active");

    activeSections.forEach((section) => {
      const articles = section.querySelectorAll(".newspaper-article");
      let hasVisibleArticles = false;

      articles.forEach((article) => {
        const title = article.querySelector("h3").textContent.toLowerCase();
        const content = article.querySelector(".content").textContent.toLowerCase();

        if (title.includes(searchTerm) || content.includes(searchTerm)) {
          article.style.display = "block";
          hasVisibleArticles = true;
        } else {
          article.style.display = "none";
        }
      });

      let noResultsMessage = section.querySelector(".no-search-results");
      if (!hasVisibleArticles && searchTerm !== "") {
        if (!noResultsMessage) {
          noResultsMessage = document.createElement("p");
          noResultsMessage.classList.add("loading-message", "no-search-results");
          noResultsMessage.textContent = `No articles found matching "${searchTerm}" in this source.`;
          section.appendChild(noResultsMessage);
        } else {
          noResultsMessage.textContent = `No articles found matching "${searchTerm}" in this source.`;
        }
      } else {
        if (noResultsMessage) {
          noResultsMessage.remove();
        }
      }
    });
  }

  function createTabs(newspapers) {
    tabsContainer.innerHTML = "";

    const sources = [...new Set(newspapers.map((n) => n.source))];

    sources.forEach((source, index) => {
      const button = document.createElement("button");
      button.classList.add("tab-button");
      button.textContent = source;
      button.dataset.source = source;

      button.addEventListener("click", () => {
        document.querySelectorAll(".tab-button").forEach((btn) =>
          btn.classList.remove("active")
        );
        button.classList.add("active");

        document.querySelectorAll(".source-section").forEach((section) => {
          section.classList.remove("active");
          section.style.display = "none";
        });

        const targetSection = document.querySelector(`.source-section[data-source="${source}"]`);
        if (targetSection) {
          targetSection.classList.add("active");
          targetSection.style.display = "block";
        }

        applySearchFilter();
      });

      tabsContainer.appendChild(button);
    });

    // Auto-click the first tab
    const firstTabButton = tabsContainer.querySelector(".tab-button");
    if (firstTabButton) {
      firstTabButton.click();
    }
  }

  fetch("news.json")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((newspapers) => {
      allNewspapers = newspapers;
      createSourceSections(allNewspapers);
      createTabs(allNewspapers);

      if (newspapers.length === 0) {
        articlesDisplayArea.innerHTML = '<p class="loading-message">No newspapers found.</p>';
      }
    })
    .catch((error) => {
      console.error("Error fetching newspapers:", error);
      articlesDisplayArea.innerHTML = `<p class="loading-message">Failed to load newspapers. Error: ${error.message}</p>`;
    });

  searchInput.addEventListener("input", applySearchFilter);
});
