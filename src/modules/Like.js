class Like {
  constructor () {
    this.myLikes = document.querySelector('.like-box')

    this.events()
  }

  events () {
    if (this.myLikes) {
      this.myLikes.addEventListener('click', e => this.clickDispatcher(e))
    }
  }

  // methods
  clickDispatcher (e) {
    let currentLikeBox = e.target
    while (!currentLikeBox.classList.contains('like-box')) {
      currentLikeBox = currentLikeBox.parentElement
    }

    if (currentLikeBox.getAttribute('data-exists') == 'yes') {
      this.deleteLike(currentLikeBox)
    } else {
      this.createLike(currentLikeBox)
    }
  }

  async createLike (currentLikeBox) {
    const response = await fetch(
      uniData.root_url + '/wp-json/uni/v1/manageLike',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': uniData.nonce
        },
        credentials: 'same-origin',
        body: JSON.stringify({ 'professorId': currentLikeBox.getAttribute('data-professor') })
      }
    )
      .then((response) => response.json())
      .then((response) => {
        if (response.message !== 'Only logged in users can create a like.') {
          currentLikeBox.setAttribute('data-exists', 'yes')
          let likeCount = parseInt(currentLikeBox.querySelector('.like-count').innerHTML, 10)
          likeCount++
          currentLikeBox.querySelector('.like-count').innerHTML = likeCount
          currentLikeBox.querySelector('i').classList.remove('fa-heart-o')
          currentLikeBox.querySelector('i').classList.add('fa-heart')
          currentLikeBox.setAttribute('data-like', response)
          //console.log(response)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  async deleteLike (currentLikeBox) {
    const response = await fetch(
      uniData.root_url + '/wp-json/uni/v1/manageLike',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': uniData.nonce
        },
        credentials: 'same-origin',
        body: JSON.stringify({ 'like': currentLikeBox.getAttribute('data-like') })
      }
    )
      .then((response) => response.json())
      .then((response) => {
        currentLikeBox.setAttribute('data-exists', 'no')
        let likeCount = parseInt(currentLikeBox.querySelector('.like-count').innerHTML, 10)
        likeCount--
        currentLikeBox.querySelector('.like-count').innerHTML = likeCount
        currentLikeBox.querySelector('i').classList.remove('fa-heart')
        currentLikeBox.querySelector('i').classList.add('fa-heart-o')
        currentLikeBox.setAttribute('data-like', '')
        //console.log(response)
      })
      .catch((error) => {
        console.log(error)
      })

    console.log('dislike')
  }
}

export default Like
