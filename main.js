import './style.css'

const inputSearch = document.getElementById('input-search')
const mainList = document.getElementById('main-list')
const dropdown = document.getElementById('dropdown')
const repositories = new Map()
let isClear = true

const closeDropDown = () => {
  while (dropdown.firstChild) {
    dropdown.firstChild.removeEventListener('click', addRepository)
    dropdown.removeChild(dropdown.firstChild)
  }
}

const removeRepository = (value, element) => {
  return function () {
    repositories.delete(value.id)

    mainList.removeChild(element)
  }
}

const addRepository = (event) => {
  const value = JSON.parse(event.target.dataset.value)

  if (repositories.has(value.id)) return

  closeDropDown()
  inputSearch.value = ''
  
  repositories.set(value.id, value)

  const element = document.createElement('li')
  element.classList.add('main-list__item')
  const elementContent = document.createElement('div')
  const elementName = document.createElement('div')
  elementName.textContent = 'Name: ' + value.name
  const elementOwner = document.createElement('div')
  elementOwner.textContent = 'Owner: ' + value.owner
  const elementStars = document.createElement('div')
  elementStars.textContent = 'Stars: ' + value.stars
  const elementClose = document.createElement('button')
  elementClose.classList.add('main-list__item-close')

  elementClose.addEventListener('click', removeRepository(value, element))

  elementContent.append(elementName, elementOwner, elementStars)
  element.append(elementContent, elementClose)
  mainList.append(element)
}

const fetchRepositories = debounce(async (value) => {
  if (!value) {
    closeDropDown()
    return
  }

  const response = await fetch('https://api.github.com/search/repositories?q=' + value)
  const data = await response.json()

  closeDropDown()

  if (!isClear)
    data.items?.forEach(item => {
      const element = document.createElement('li')
      element.setAttribute('data-value', JSON.stringify({ name: item.name, owner: item.owner.login, stars: item.stargazers_count, id: item.id }))
      element.classList.add('header-dropdown__item')
      element.addEventListener('click', addRepository)

      element.textContent = item.name
      dropdown.append(element)
    })
}, 400)

inputSearch.addEventListener('input', (event) => {
  const value = event.target.value.trim()

  isClear = !value.length
  
  fetchRepositories(value)
})

function debounce(fn, debounceTime) {
  let timeout;

  return function() {
      const fnCall = () => {fn.apply(this, arguments)}
      clearTimeout(timeout)

      timeout = setTimeout(fnCall, debounceTime)
  }
}