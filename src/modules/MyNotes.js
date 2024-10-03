class MyNotes {
  constructor () {
    if (document.querySelector('#my-notes')) {
      this.myNotes = document.querySelector('#my-notes')
      this.deleteBtns = this.myNotes.querySelectorAll('.delete-note')
      this.editBtns = this.myNotes.querySelectorAll('.edit-note')
      this.saveBtns = this.myNotes.querySelectorAll('.save-note')
      this.addBtn = document.querySelector('.submit-note')

      this.events()
    }
  }

  events () {
    this.myNotes.addEventListener('click', e => this.clickHandler(e))
    this.addBtn.addEventListener('click', () => this.createNote())
  }

  clickHandler (e) {
    if (e.target.classList.contains('delete-note') || e.target.classList.contains('fa-trash-o')) this.deleteNote(e)
    if (e.target.classList.contains('edit-note') || e.target.classList.contains('fa-pencil') ||
      e.target.classList.contains('fa-times')) this.editNote(e)
    if (e.target.classList.contains('update-note') || e.target.classList.contains('fa-arrow-right')) this.saveNote(e)
  }

  // Methods
  async deleteNote (e) {
    const thisNote = e.target.closest('li')

    await fetch(uniData.root_url + '/wp-json/wp/v2/note/' + thisNote.getAttribute('data-id'),
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': uniData.nonce
        },
        credentials: 'same-origin',
        body: null
      })
      .then((response) => response.json())
      .then((response) => {
        console.log(response.userNoteCount)
        thisNote.className = 'hidden'
        //document.querySelector('.note-limit').classList.add('update-note')
        if (response.userNoteCount < 5) {
          document.querySelector('.note-limit-message').classList.remove('active')
        }
      })
      .catch((error) => {
        console.log('error - ' + error)
      })
  }

  async editNote (e) {
    const thisNote = e.target.closest('li')
    if (thisNote.getAttribute('state') == 'editable') {
      this.makeNoteReadOnly(thisNote)
    } else {
      this.makeNoteEditable(thisNote)
    }
  }

  makeNoteEditable (thisNote) {
    thisNote.querySelector('.edit-note').innerHTML = `<i class="fa fa-times mr-1" aria-hidden="true"></i>Cancel`
    thisNote.querySelector('input').removeAttribute('readonly')
    thisNote.querySelector('input').classList.add('note-active-field')
    thisNote.querySelector('textarea').removeAttribute('readonly')
    thisNote.querySelector('textarea').classList.add('note-active-field')
    thisNote.querySelector('.update-note').classList.add('update-note--visible')
    thisNote.setAttribute('state', 'editable')
  }

  makeNoteReadOnly (thisNote) {
    thisNote.querySelector('.edit-note').innerHTML = `<i class="fa fa-pencil mr-1" aria-hidden="true"></i>Edit`
    thisNote.querySelector('input').setAttribute('readonly', 'readonly')
    thisNote.querySelector('input').classList.remove('note-active-field')
    thisNote.querySelector('textarea').setAttribute('readonly', 'readonly')
    thisNote.querySelector('textarea').classList.remove('note-active-field')
    thisNote.querySelector('.update-note').classList.remove('update-note--visible')
    thisNote.removeAttribute('state', 'cancel')
  }

  async saveNote (e) {
    const thisNote = e.target.closest('li')
    const updatedPost = {
      'title': thisNote.querySelector('input').value,
      'content': thisNote.querySelector('textarea').value
    }

    await fetch(
      uniData.root_url + '/wp-json/wp/v2/note/' + thisNote.getAttribute('data-id'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': uniData.nonce
        },
        credentials: 'same-origin',
        body: JSON.stringify(updatedPost)
      })
      .then((response) => {
        this.makeNoteReadOnly(thisNote)
        return response.json()
      })
      .catch((error) => {
        console.log('error - ' + error)
      })

  }

  async createNote () {
    const ourNewPost = {
      'title': document.querySelector('.new-note-title').value,
      'content': document.querySelector('.new-note-body').value,
      'status': 'private'
    }

    await fetch(
      uniData.root_url + '/wp-json/wp/v2/note/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': uniData.nonce
        },
        credentials: 'same-origin',
        body: JSON.stringify(ourNewPost)
      })
      .then((response) => response.json())
      .then((response) => {
        if (response.message == 'You have reached your note limit.') {
          document.querySelector('.note-limit-message').classList.add('active')
        } else {
          document.querySelector('.note-title-field').value = ''
          document.querySelector('.note-body-field').value = ''

          const li = document.createElement('li')
          li.className = ''
          li.setAttribute('data-id', response.id)
          li.innerHTML = `
        
          <input readonly class="note-title-field" type="text" value="${response.title.raw}">
          <span class="edit-note"><i class="fa fa-pencil" aria-hidden="true"></i>Edit</span>
          <span class="delete-note"><i class="fa fa-trash-o" aria-hidden="true"></i>Delete</span>
       
          <textarea readonly class="note-body-field" name="" id="" cols="30" rows="10">${response.content.raw}</textarea>
          <span class="update-note btn btn--blue btn--small"><i class="fa fa-arrow-right" aria-hidden="true"></i>Save</span>
          `

          document.querySelector('#my-notes').prepend(li)

        }
      })
      .catch((error) => {
        console.error(error)
      })

  }
}

export default MyNotes
