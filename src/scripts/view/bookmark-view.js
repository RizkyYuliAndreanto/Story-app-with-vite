// src/scripts/view/bookmark-view.js
class BookmarkView {
  constructor() {}

  render() {
    return `
        <section class="bookmark-page">
          <h2 style="color: white;"><i data-feather="bookmark" style="color: white;"></i> Cerita Tersimpan</h2>
          <div id="bookmarked-story-list" class="list"></div>
        </section>
      `;
  }

  showLoading() {
    const storyList = document.getElementById("bookmarked-story-list");
    if (storyList) {
      storyList.innerHTML =
        '<div class="loading" style="color: white;"><i data-feather="loader" style="color: white;"></i> Memuat cerita tersimpan...</div>';
      if (window.feather) feather.replace();
    }
  }

  renderBookmarkedStories(stories) {
    const storyList = document.getElementById("bookmarked-story-list");
    if (storyList) {
      if (stories && stories.length > 0) {
        storyList.innerHTML = stories
          .map(
            (story) => `
                <div class="story-card" data-story-id="${story.id}">
                  <img src="${story.photoUrl}" alt="${
              story.name
            }" loading="lazy" />
                  <div class="story-card-content" style="color: white;">
                    <h3><i data-feather="user" style="color: white;"></i> ${
                      story.name
                    }</h3>
                    <p><i data-feather="align-left" style="color: white;"></i> ${story.description.substring(
                      0,
                      100
                    )}${story.description.length > 100 ? "..." : ""}</p>
                    ${
                      story.lat && story.lon
                        ? `<p class="location" style="color: white;"><i data-feather="map-pin" style="color: white;"></i> Lokasi Tersedia</p>`
                        : ""
                    }
                    <p class="date" style="color: white;"><i data-feather="calendar" style="color: white;"></i> ${new Date(
                      story.createdAt
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}</p>
                    <div class="story-actions">
                      <a href="#/stories/${
                        story.id
                      }" class="btn-read-detail">Baca Detail</a>
                      <button id="bookmark-btn-${
                        story.id
                      }" class="bookmark-btn bookmarked" data-story-id="${
              story.id
            }">
                          <i class="fas fa-bookmark"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `
          )
          .join("");
      } else {
        storyList.innerHTML = `
            <div class="info-message" style="color: white;">
              <i data-feather="info" style="color: white;"></i> Belum ada cerita yang tersimpan.
            </div>
          `;
      }
      if (window.feather) feather.replace();
    }
  }

  showError(message) {
    const storyList = document.getElementById("bookmarked-story-list");
    if (storyList) {
      storyList.innerHTML = `
              <div class="error" style="color: white;">
                <i data-feather="alert-circle" style="color: white;"></i> ${message}
              </div>
            `;
      if (window.feather) feather.replace();
    }
  }
}

export default BookmarkView;
