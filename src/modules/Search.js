class Search {
  // initiate
  constructor () {
    this.addSearchHTML()
    this.resultsDiv = document.querySelector('#search-overlay__results')
    this.openButton = document.querySelector('.search-trigger')
    this.closeButton = document.querySelector('.search-overlay__close')
    this.searchOverlay = document.querySelector('.search-overlay')
    this.searchField = document.querySelector('#search-term')

    this.events()
    this.isOverlayOpen = false
    this.typingTimer
    this.isSpinnerVisible = false
    this.previousValue
  }

  // events
  events () {
    this.openButton.addEventListener('click', this.openOverlay.bind(this))
    this.closeButton.addEventListener('click', this.closeOverlay.bind(this))
    //document.addEventListener('keydown', this.keyPressDispatcher.bind(this))
    this.searchField.addEventListener('keyup', this.typingLogic.bind(this))
  }

  // methods
  typingLogic () {
    if (this.searchField.value != this.previousValue) {
      clearTimeout(this.typingTimer)

      if (this.searchField.value) {
        if (!this.isSpinnerVisible) {
          this.resultsDiv.innerHTML = `<div class="spinner-loader"></div>`
          this.isSpinnerVisible = true
        }
        this.typingTimer = setTimeout(this.getResults.bind(this), 7500)
      } else {
        this.resultsDiv.innerHTML = ''
        this.isSpinnerVisible = false
      }
    }
    this.previousValue = this.searchField.value
  }

  async getResults () {
    await fetch(uniData.root_url + '/wp-json/uni/v1/search?term=' + this.searchField.value)
      .then((response) => response.json())
      .then((data) => {
        this.resultsDiv.innerHTML = `
                <div class="row">
                    <div class="one-third">
                        <h2 class="search-overlay__section-title">General information</h2>
                        ${data.generalInfo.length ? '<ul class="link-list min-list">' : '<p>No posts was found</p>'}
                        ${data.generalInfo.map(item => `<li><a href="${item.permalink}">${item.title}</a> ${item.postType == 'post' ? `by ${item.authorName}` : ''}</li>`).join('')}
                        ${data.generalInfo.length ? '</ul>' : ''}
                    </div>
                    <div class="one-third">
                        <h2 class="search-overlay__section-title">Programs</h2>
                        ${data.programs.length ? '<ul class="link-list min-list">' : '<p>No programs was found</p>'}
                        ${data.programs.map(item => `<li><a href="${item.permalink}">${item.title}</a></li>`).join('')}
                        ${data.programs.length ? '</ul>' : ''}
                        
                        <h2 class="search-overlay__section-title">Professors</h2>
                        ${data.professors.length ? '<ul class="professor-cards">' : '<p>No professors was found</p>'}
                        ${data.professors.map(item => `
                            <li class="professor-card__list-item">
                                <a class="professor-card" href="${item.permalink}">
                                    <img class="professor-card__image"
                                         src="${item.image}" alt="">
                                    <span class="professor-card__name">${item.title}</span>
                                </a>
                            </li>
                        `).join('')}
                        ${data.professors.length ? '</ul>' : ''}
                    </div>
                    <div class="one-third">
                        <h2 class="search-overlay__section-title">Campuses</h2>
                        ${data.campuses.length ? '<ul class="link-list min-list">' : '<p>No campuses was found</p>'}
                        ${data.campuses.map(item => `<li><a href="${item.permalink}">${item.title}</a></li>`).join('')}
                        ${data.campuses.length ? '</ul>' : ''}
                        
                        <h2 class="search-overlay__section-title">Events</h2>
                        ${data.events.length ? '' : '<p>No events was found</p>'}
                        ${data.events.map(item => `
                            <div class="event-summary">
                              <a class="event-summary__date t-center" href="${item.permalink}">
                                <span class="event-summary__month">${item.month}</span>
                                <span class="event-summary__day">${item.day}</span>
                              </a>
                              <div class="event-summary__content">
                                <h5 class="event-summary__title headline headline--tiny">
                                  <a href="${item.permalink}">${item.title}</a></h5>
                                <p>${item.description}<a href="${item.permalink}" class="nu gray">Learn more</a>
                                </p>
                              </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
              `
      })
      .catch(() => {
        this.resultsDiv.innerHTML = '<p>Unexpected error, please try again</p>'
      })

    /*const urls = [
        uniData.root_url + '/wp-json/wp/v2/posts?search=' + this.searchField.value,
        uniData.root_url + '/wp-json/wp/v2/pages?search=' + this.searchField.value
    ];
    await Promise.all(urls.map(url => fetch(url).then(res => res.json())))
      .then((res) => {
          let combinedResults = res[0].concat(res[1]);
          this.resultsDiv.innerHTML = `
          <h2 class="search-overlay__section-title">General information</h2>
          ${combinedResults.length ? '<ul class="link-list min-list">' : '<p>No general info was found</p>'}
              ${combinedResults.map(item => `<li><a href="${item.link}">${item.title.rendered}</a> ${item.type == 'post' ? `by ${item.authorName}` : ''}`).join('')}
          ${combinedResults.length ? '</ul>' : ''}
        `;
      })
      .catch(() => {
          this.resultsDiv.innerHTML = '<p>Unexpected error, please try again</p>'
      })*/

    /*await fetch(uniData.root_url + '/wp-json/wp/v2/posts?search=' + this.searchField.value)
      .then((response) => response.json())
      .then((data) => {
          this.resultsDiv.innerHTML = `
            <h2 class="search-overlay__section-title">General information</h2>
            ${data.length ? '<ul class="link-list min-list">' : '<p>No posts was found</p>'}
                ${data.map(item => `<li><a href="${item.link}">${item.title.rendered}</a></li>`).join('')}
            ${data.length ? '</ul>' : ''}
          `;
      })
      .catch(() => {
          this.resultsDiv.innerHTML = '<p>Unexpected error, please try again</p>'
      })*/

    this.isSpinnerVisible = false
  }

  keyPressDispatcher (e) {
    //if (e.keyCode == 83 && !this.isOverlayOpen && !(document.querySelector("input, textarea") == document.activeElement)) {
    if (e.keyCode == 83 && !this.isOverlayOpen) {
      this.openOverlay()
    }

    if (e.keyCode == 27 && this.isOverlayOpen) {
      this.closeOverlay()
    }
  }

  openOverlay (e) {
    e.preventDefault()
    this.searchOverlay.classList.add('search-overlay--active')
    //document.getElementsByTagName('body')[0].classList.add('body-no-scroll')
    document.body.classList.add('body-no-scroll')
    this.searchField.value = ''
    setTimeout(() => this.searchField.focus(), 300)
    this.isOverlayOpen = true
  }

  closeOverlay () {
    this.searchOverlay.classList.remove('search-overlay--active')
    document.body.classList.remove('body-no-scroll')
    this.isOverlayOpen = false
  }

  addSearchHTML () {
    document.body.innerHTML += `
            <div class="search-overlay">
                <div class="search-overlay__top">
                    <div class="container">
                        <i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
                        <input type="text" class="search-term" placeholder="What are you looking for?" id="search-term">
                        <i class="fa fa-window-close search-overlay__close" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="container">
                    <div id="search-overlay__results"></div>
                </div>
            </div>
        `
  }

}

export default Search
