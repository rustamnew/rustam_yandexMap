ymaps.ready(init);

let placemarkArray = []

let ObjAddress

let storage = localStorage
console.log(storage)

let geoObjectsVar
let clustererVar

//localStorage.clear()

for (key in storage) {
    if (typeof storage[key] == 'string') {
        let obj = JSON.parse(storage[key])
        placemarkArray.push(obj)
    }
}

console.log(placemarkArray)


var modal = document.querySelector('#modal')
var closeModal = document.querySelector('.modal__close')
var submit = document.querySelector('#submit')

closeModal.addEventListener('click', (e) => {
    e.currentTarget.closest('.modal').style.top = 0
    e.currentTarget.closest('.modal').style.left = -500+'px'
})

submit.addEventListener('click', (e) => {
    e.preventDefault()

    let form = document.querySelector('#form')

    let name = form.elements.name.value
    let place = form.elements.place.value
    let review = form.elements.review.value
    let address = ObjAddress

    console.log(name)
    console.log(place)
    console.log(review)
    console.log(coords)
    console.log(address)

    i = localStorage.length + 1

    let placemark = 'placemark'+ i

    console.log(placemark)
    console.log(i)


    storage[placemark] = JSON.stringify({
        name: name,
        place: place,
        review: review,
        coords: coords,
        address: address
    })

    placemarkArray.push({
        name: name,
        place: place,
        review: review,
        coords: coords,
        address: address
    })
   

    console.log(storage)

    console.log(placemarkArray)

    modal.style.top = 0
    modal.style.left = -500+'px'

    createPlacemarks()
})

let geoObjects = []

function init() {
    // Создание карты.
    var myMap = new ymaps.Map("map", {
        // Координаты центра карты.
        // Порядок по умолчанию: «широта, долгота».
        // Чтобы не определять координаты центра карты вручную,
        // воспользуйтесь инструментом Определение координат.
        center: [55.76, 37.64],
        // Уровень масштабирования. Допустимые значения:
        // от 0 (весь мир) до 19.
        zoom: 7,
        controls: []
    });

    geoObjectsVar = myMap.geoObjects

    myMap.controls.add('zoomControl');
    myMap.behaviors.disable(['dblClickZoom'])

    addListeners(myMap)


    let i = 0

    placemarkArray.forEach((e) => {

        geoObjects[i] = new ymaps.Placemark(e.coords, {
            //balloonContentHeader: getReviews(e.coords),
            balloonContentBody: ` ${getReviews(e.coords)}
                            <form class="form" id="formBaloon" data-coords=${e.coords}>
                                 <input name="name" type="text" placeholder="Имя" class="input text">
                                 <input name="place" type="text" placeholder="Место" class="input text">
                                 <textarea name="review" placeholder="Отзыв" class="input text textarea"></textarea>
                                 <input type="button" value="Добавить" data-role="modalSubmit">
                            </form>
                                 `,
            balloonContentFooter: `${e.address}<p>${e.coords}</p>`,
            clusterCaption: `метка ${i}`
            
            
        })

        geoObjects[i].events.add('click', () => {
            console.log(e.coords)
        })
        
        myMap.geoObjects.add(geoObjects[i])
        

        i++
    })

    let clusterer = new ymaps.Clusterer({
        groupByCoordinates: false,
        //clusterBalloonContentLayout:
    })

    clustererVar = clusterer
    
    clusterer.add(geoObjects)

    clusterer.options.set({
        gridSize: 80,
        clusterDisableClickZoom: true
    });

    

    myMap.geoObjects.add(clusterer)
}

document.addEventListener('click', (e) => {
    if (e.target.dataset.role == 'modalSubmit') {

        let form = document.querySelector('#formBaloon')
        let name = form.elements.name.value
        let place = form.elements.place.value
        let review = form.elements.review.value
        

        
        let coordsString = `${form.dataset.coords}`
        let coordsSplit = coordsString.split(',')
        coordsSplitNumber = []
        coordsSplit.forEach((e) => {
            coordsSplitNumber.push(Number(e))
        })
        coords = coordsSplitNumber
        console.log(coords)

        let address = getAddress(coords)


        i = localStorage.length + 1

        let placemark = 'placemark'+ i

        console.log(placemark)
        console.log(i)

        storage[placemark] = JSON.stringify({
            name: name,
            place: place,
            review: review,
            coords: coords,
            address: address
        })

        placemarkArray.push({
            name: name,
            place: place,
            review: review,
            coords: coords,
            address: address
        })

        form.elements.name.value = ''
        form.elements.place.value = ''
        form.elements.review.value = ''
    
        createPlacemarks()
    }
})


function createPlacemarks() {
    clustererVar.removeAll()
    
    let i = 0

    placemarkArray.forEach((e) => {
        

        geoObjects[i] = new ymaps.Placemark(e.coords, {
            //balloonContentHeader: getReviews(e.coords),
            balloonContentBody: ` ${getReviews(e.coords)}
                            <form class="form" id="formBaloon" data-coords=${e.coords}>
                                 <input name="name" type="text" placeholder="Имя" class="input text">
                                 <input name="place" type="text" placeholder="Место" class="input text">
                                 <textarea name="review" placeholder="Отзыв" class="input text textarea"></textarea>
                                 <input type="button" value="Добавить" data-role="modalSubmit">
                            </form>
                                 `,
            balloonContentFooter: `${e.address}<p>${e.coords}</p>`,
            clusterCaption: `метка ${i}`
            
            
        })

        geoObjects[i].events.add('click', () => {
            console.log(e.coords)
        })
        
        geoObjectsVar.add(geoObjects[i])
        clustererVar.add(geoObjects[i])

        i++
    })

    //clustererVar = clusterer
    
    clustererVar.add(geoObjects)


    geoObjectsVar.add(clustererVar)
}


function addListeners(myMap) {
    myMap.events.add('click', (e) => openEmptyModal(e));
}


async function openEmptyModal(e) {

    let inputs = document.querySelectorAll('.input.text')
    inputs.forEach((e) => {
        e.value = ''
    })

    let posX = e.getSourceEvent().originalEvent.domEvent.originalEvent.clientX;

    let posY = e.getSourceEvent().originalEvent.domEvent.originalEvent.clientY;

    console.log(posX)
    console.log(posY)

    coords = e.get('coords')

    const objectInfo = await getClickCoords(coords)
    console.log(objectInfo)
    ObjAddress = objectInfo

    modal.style.left = posX+'px'
    modal.style.top = posY+'px'

    
}

function getAddressAndCoords(coords) {
    let equal = false
    let addressAndCoords
        
    placemarkArray.forEach((e) => {
        let equal = false
        
        for (i = 0; i < e.coords.length; i++) {
            if (e.coords[i] == coords[i]) {
                equal = true
            } else {equal = false}
        }

        if (equal) {
            addressAndCoords = `${e.address}<p>${e.coords}</p>`
        }
        
    })

    return addressAndCoords
}

function getClickCoords(coords) {
    return new Promise((resolve, reject) => {
        ymaps
            .geocode(coords)
            .then((response) => resolve(response.geoObjects.get(0).getAddressLine()))
            .catch((e) => reject(e))    
    })
}

function getReviews(coords) {
    let baloonHeaderHTML = ''

    placemarkArray.forEach((e) => {
        let equal = false
        
        for (i = 0; i < e.coords.length; i++) {
            if (e.coords[i] == coords[i]) {
                equal = true
            } else {equal = false}
        }

        if (equal) {
            baloonHeaderHTML += `<p><small>${e.name} </small><i>${e.place}</i></p><p>${e.review}</p>`
        }
    })

    return baloonHeaderHTML
}

function getAddress(coords) {
    let equal = false
    let address
        
    placemarkArray.forEach((e) => {
        let equal = false
        
        for (i = 0; i < e.coords.length; i++) {
            if (e.coords[i] == coords[i]) {
                equal = true
            } else {equal = false}
        }

        if (equal) {
            address = e.address
        }
        
    })

    return address
}


/*
function createPlacemarks() {
    let i = geoObjects.length
    console.log(i)

    

        geoObjects[i] = new ymaps.Placemark(placemarkArray[i].coords, {
            balloonContentHeader: getReviews(placemarkArray[i].coords),
            balloonContentBody: ` 
                            <form class="form" id="formBaloon" data-coords=${placemarkArray[i].coords}>
                                 <input name="name" type="text" placeholder="Имя" class="input text">
                                 <input name="place" type="text" placeholder="Место" class="input text">
                                 <textarea name="review" placeholder="Отзыв" class="input text textarea"></textarea>
                                 <input type="button" value="Добавить" data-role="modalSubmit">
                            </form>
                                 `,
            balloonContentFooter: `${getAddressAndCoords(placemarkArray[i].coords)}`,
            clusterCaption: `метка ${i}`
            
        })

        geoObjects[i].events.add('click', () => {
            console.log(placemarkArray[i].coords)
        })
        
        geoObjectsVar.add(geoObjects[i])
        clustererVar.add(geoObjects[i])
    
}*/