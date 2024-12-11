/*
 * Name: Aldrich Siwi and Jayson Xu
 * Date: December 2nd, 2024
 * Section: CSE 154 AB and AC
 * Description: This JavaScript application serves as the client-side logic for
 * a web platform designed to manage and display elder profiles.
 * The platform allows users to: Browse available elder profiles with
 * detailed information, Search for elders based on specific criteria,
 * View detailed profiles for individual elders, Place orders for services related to elders,
 * and Log in to personalize the experience and store user-related data.
 * The application dynamically interacts with a server-side API to fetch,
 * display, and update data. It incorporates modular event listeners,
 * DOM manipulation, and state management using sessionStorage.
 */
"use strict";
const HALF_STAR_VALUE = 0.5;
const ISO_DATE_TIME_LENGTH = 19;

(function() {
  window.addEventListener("load", init);
  document.addEventListener("DOMContentLoaded", setupEventListeners);
  window.onclick = function(event) {
    const modal = id('custom-alert');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} name - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Checks the status of a fetch response, throwing an error if it's not successful.
   * @param {Response} res - The response object from a fetch request.
   * @returns {Response} - The original response if the status is OK.
   * @throws {Error} - If the response status is not OK, an error is thrown.
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Handles errors by displaying a user-friendly message and logging the error for debugging.
   * @param {Error} err1 - The error object containing a message.
   * @param {Error} err2 - The error object containing a message.
   */
  function handleError(err1, err2) {
    showAlert(err1 + err2);
  }

  /**
   * Fetches all elders from the server and populates them on the page.
   */
  function init() {
    const username = sessionStorage.getItem('username');
    if (username) {
      id("login").src = "img/" + username.replace(/\s+/g, '-').toLowerCase() + '.png';
    }
    fetchElders();
  }

  /**
   * Fetches all elders from the server and populates them on the page.
   */
  function fetchElders() {
    fetch('/api/elders')
      .then(statusCheck)
      .then(response => response.json())
      .then(data => {
        populateElders(data.elders);
      })
      .catch(error => {
        handleError("Failed to load project data: ", error);
      });
  }

  /**
   * Performs a search operation based on the user input and filters the result displayed
   * in the elders table.
   */
  function searchTable() {
    const nameInput = document.getElementById('name-search').value.toLowerCase();
    const ageInput = document.getElementById('age-search').value.toLowerCase();
    const priceInput = document.getElementById('price-search').value.toLowerCase();
    const degreeCheckbox = id("degree-check-box");

    let url = '/api/elders?';
    if (nameInput) {
      url += '&name=' + nameInput;
    }
    if (ageInput) {
      url += '&age=' + ageInput;
    }
    if (priceInput) {
      url += '&price=' + priceInput;
    }
    if (degreeCheckbox && degreeCheckbox.checked) {
      url += '&degree=true';
    }

    fetch(url)
      .then(statusCheck)
      .then(response => response.json())
      .then(data => {
        populateElders(data.elders);
      })
      .catch(error => {
        handleError("Failed to load project data: ", error);
      });
  }

  /**
   * Populates the homepage with elders fetched from the server. Each elder is displayed in a
   * card format with name, age and so on.
   * @param {Array} elders - Array of elder data to be displayed on the home page.
   */
  function populateElders(elders) {
    const elderContainer = document.getElementById("home");
    elderContainer.classList.add('elderlist');
    elderContainer.textContent = '';

    elders.forEach(elder => {
      const homeView = document.createElement("article");
      homeView.classList.add("card");
      homeView.id = elder.id;
      const img = document.createElement("img");
      img.src = "img/" + elder.name.replace(/\s+/g, '-').toLowerCase() + '.png';
      img.width = 100;
      img.height = 40;
      homeView.appendChild(img);

      const second = document.createElement("div");
      homeView.appendChild(second);
      const name = document.createElement("p");
      name.textContent = elder.name;
      name.classList.add("individual");
      name.addEventListener("click", showUserView);
      second.appendChild(name);

      const paragraph = document.createElement("p");
      paragraph.textContent = "age: " + elder.age + " price: " + elder.price;
      second.appendChild(paragraph);
      const paragraph2 = document.createElement("p");
      paragraph2.textContent = "average mark: " + elder.avgMark.toFixed(2);
      second.appendChild(paragraph2);

      const meta = document.createElement("div");
      meta.classList.add("meta");
      homeView.appendChild(meta);
      elderHelper(elder, meta);
      elderContainer.appendChild(homeView);
    });
  }

  /**
   * add conponent into meta container
   * @param {json} elder elder object
   * @param {Object} meta container
   */
  function elderHelper(elder, meta) {
    const metaP3 = document.createElement("div");
    meta.appendChild(metaP3);
    const imgHeart = document.createElement("img");
    imgHeart.src = 'img/cart.png';
    imgHeart.width = 40;
    imgHeart.addEventListener("click", order);
    metaP3.appendChild(imgHeart);
    const metaP2 = document.createElement("p");
    metaP2.textContent = "Order";
    metaP3.appendChild(metaP2);
  }

  /**
   * Transition from the home view to a detailed user view, by the user on clicking
   * the card.
   * @param {Event} event - The event object associated with the user interaction
   *                        that triggers the view transition.
   */
  function showUserView(event) {
    const homeView = document.getElementById("home");
    homeView.classList.add('hidden');
    id("search-bar").classList.add('hidden');
    const userView = document.getElementById("user");
    userView.classList.remove('hidden');

    const item = event.target.closest("article");
    fetch('/api/elders?id=' + item.id)
      .then(statusCheck)
      .then(response => response.json())
      .then(data => {
        populateUser(data);
      })
      .catch(error => {
        handleError("Failed to load project data: ", error);
      });
  }

  /**
   * Dynamically renders yips for a specific user onto the user page.
   * @param {Object[]} data - Array of yip data specific to a user.
   */
  function populateUser(data) {
    if (!data) {
      return;
    }
    const user = data.elders[0];
    const userContainer = document.getElementById("user");
    userContainer.textContent = '';
    const homeView = document.createElement("article");
    homeView.classList.add("single");
    userContainer.appendChild(homeView);

    const title = document.createElement("h2");
    title.textContent = user.name;
    homeView.appendChild(title);

    const img = document.createElement("img");
    img.src = "img/" + user.name.replace(/\s+/g, '-').toLowerCase() + '.png';
    homeView.appendChild(img);

    const div1 = document.createElement("div");
    div1.classList.add("paragraphs");
    homeView.appendChild(div1);
    const line1 = document.createElement("p");
    line1.textContent = "age: " + user.age;
    div1.appendChild(line1);
    const line2 = document.createElement("p");
    line2.textContent = "price: " + user.price;
    div1.appendChild(line2);
    const line3 = document.createElement("p");
    line3.textContent = "education: " + user.education;
    div1.appendChild(line3);
    const line4 = document.createElement("p");
    line4.textContent = "yearsOfWork: " + user.yearsOfWork;
    div1.appendChild(line4);
  }

  /**
   * Place order It checks if a user is logged in by verifying the
   * presence of a username in sessionStorage and if the user is not logged in,
   * it will display a login page if the user click the order.
   * @param {Event} event -  The event object triggered by the user interaction.
   */
  function order(event) {
    if (!sessionStorage.getItem('username')) {
      id('home').classList.add('hidden');
      id('search-bar').classList.add('hidden');
      id('user').classList.add('hidden');
      id("review-section").classList.add('hidden');
      id('login-section').classList.remove('hidden');
      return;
    }
    id('home').classList.add('hidden');
    id('search-bar').classList.add('hidden');
    id('user').classList.add('hidden');
    id('order').classList.remove('hidden');
    const elderId = event.target.closest("article").id;
    sessionStorage.setItem('elderId', elderId);
    id('start-time').disabled = false;
    id('end-time').disabled = false;
    id('address').disabled = false;
    id('start-time').value = '';
    id('end-time').value = '';
    id('address').value = '';
    id('file-input').value = '';
    id('file-id').textContent = '';
    id('file-id').disabled = false;
    id('order-div').classList.remove('hidden');
    id('submit-div').classList.add('hidden');

  }

  /**
   * Reverts the state of the order form to an editable mode.
   * @param {Event} event -  The event object triggered by the user interaction.
   */
  function doUnconfirm(event) {
    event.preventDefault();
    id('start-time').disabled = false;
    id('end-time').disabled = false;
    id('address').disabled = false;
    id('file-input').disabled = false;
    id('order-div').classList.remove('hidden');
    id('submit-div').classList.add('hidden');
  }

  /**
   * Dynamically adjusts the base font size of the web page depending on the user's role.
   * @param {String} role -  The role of the user, used to determine the font size adjustment.
   */
  function adjustFontSizeForElders(role) {
    const rootElement = document.documentElement;
    if (role === 'Elder') {
      rootElement.style.fontSize = '18px';
    } else {
      rootElement.style.fontSize = '16px';
    }
  }

  /**
   * Toggles the display mode between list view and grid view.
   */
  function modeClick() {
    const elderContainer = document.getElementById("home");
    if (elderContainer.classList.contains('elderlist')) {
      elderContainer.classList.remove('elderlist');
      elderContainer.classList.add('eldergrid');
      const articles = elderContainer.querySelectorAll("article");
      articles.forEach((article) => {
        article.classList.remove('card');
        article.classList.add('card2');
      });
    } else {
      elderContainer.classList.remove('eldergrid');
      elderContainer.classList.add('elderlist');
      const articles = elderContainer.querySelectorAll("article");
      articles.forEach((article) => {
        article.classList.remove('card2');
        article.classList.add('card');
      });
    }
  }

  /**
   * for logging out the account.
   * @param {event} event - The event object triggered by the user interaction.
   */
  function DologoutBtn(event) {
    if (sessionStorage.getItem('username')) {
      event.preventDefault();
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('userId');
      id('login').src = "img/login.png";
    } else {
      showAlert("you have not logged in yet");
    }
  }

  /**
   * Showing the error message
   * @param {string} message - The message.
   */
  function showAlert(message) {
    id('alert-message').innerText = message;
    id('custom-alert').style.display = 'block';
  }

  /**
   * Formating the date
   * @param {date} input - The users input for the date.
   * @return {date} input - The formatted date.
   */
  function formatDate(input) {
    const date = new Date(input);
    const formattedDate = date.toISOString()
      .replace('T', ' ')
      .substring(0, ISO_DATE_TIME_LENGTH);
    return formattedDate;
  }

  /**
   * this button is for reviewing the order
   * @param {integer} pid - Parent id.
   * @param {event} event = The event object triggered by the user interaction.
   */
  function reviewBtn(pid, event) {
    const divTop = event.target.parentElement;
    const lastChild = divTop.lastElementChild.previousElementSibling;
    let targetElement = null;
    if (lastChild.tagName === 'A') {
      targetElement = lastChild.previousElementSibling;
    } else {
      targetElement = lastChild;
    }
    if ("Mark: None" === targetElement.textContent) {
      id("user").classList.add('hidden');
      id("order").classList.add('hidden');
      id("error").classList.add('hidden');
      id("login-section").classList.add('hidden');
      id("home").classList.add('hidden');
      id("search-bar").classList.add('hidden');
      id('history-section').classList.add('hidden');
      id('review-section').classList.remove('hidden');
      const stars = document.querySelectorAll('.star');
      stars.forEach(star => {
        star.classList.remove('selected');
      });
      id('review-comment').value = '';
      id('order-id').textContent = pid;
    } else {
      showAlert("You have made review.");
    }
  }

  /**
   * This function is for load the history order of the user.
   */
  function loadOrderHistory() {
    const id = sessionStorage.getItem("userId");
    let url = '/api/orders?pid=' + id;
    fetch(url)
      .then(statusCheck)
      .then(response => response.json())
      .then(data => {
        const orders = data.orders;

        const orderList = document.getElementById('order-list');
        orders.forEach(ord => {
          const orderItem = document.createElement('div');
          orderItem.className = 'order-item';
          orderItem.innerHTML = `
            <h3>Order ID: ${ord.id}</h3>
            <p>Elder: ${ord.elderName}</p>
            <p>Start Time: ${formatDate(ord.startTime)}</p>
            <p>End Time: ${formatDate(ord.endTime)}</p>
            <p>Confirm Num: ${ord.confirmNum}</p>
            <p>Mark: ${ord.mark ? ord.mark : 'None'}</p>
          `;
          if (ord.fileName) {
            const aHref = document.createElement('a');
            aHref.href = `http://localhost:3000/api/download/${ord.fileName}`;
            aHref.textContent = "Download file";
            orderItem.appendChild(aHref);
          }

          const btn = document.createElement('button');
          btn.textContent = "Review";
          btn.addEventListener("click", (event) => reviewBtn(ord.id, event));
          orderItem.appendChild(btn);

          orderList.appendChild(orderItem);
        });
      })
      .catch(error => {
        handleError("Failed to load project data: ", error);
      });
  }

  /**
   * Getting the order history event.
   * @param {event} event - The event object triggered by the user interaction.
   */
  function DoOrderHistory(event) {
    if (sessionStorage.getItem('username')) {
      event.preventDefault();
      id("user").classList.add('hidden');
      id("order").classList.add('hidden');
      id("error").classList.add('hidden');
      id("login-section").classList.add('hidden');
      id("home").classList.add('hidden');
      id("search-bar").classList.add('hidden');
      id("register-form").classList.add('hidden');
      id("review-section").classList.add('hidden');
      id('history-section').classList.remove('hidden');
      document.getElementById('order-list').textContent = '';
      loadOrderHistory();
    } else {
      showAlert("you have not logged in yet");
    }
  }

  /**
   * Updating the stars
   * @param {integer} rating - The ratings value.
   */
  function updateStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
      star.classList.remove('selected', 'half');
      const starValue = parseFloat(star.getAttribute('data-value'));
      if (rating >= starValue) {
        star.classList.add('selected');
      } else if (rating === starValue - HALF_STAR_VALUE) {
        star.classList.add('half');
      }
    });
  }

  /**
   * This function is for submiting the reviews
   * @param {event} event - The event object triggered by the user interaction.
   */
  function reviewSubmit(event) {
    let selectedRating = "0";
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
      const tar = parseFloat(star.getAttribute('data-value'));
      if (star.classList.contains("selected")) {
        selectedRating = Math.max(selectedRating, tar);
      } else if (star.classList.contains("half")) {
        selectedRating = Math.max(selectedRating, tar - HALF_STAR_VALUE);
      }
    });

    const comment = id('review-comment').value;
    if (selectedRating > '0' && comment.trim() !== '') {
      const tar = event.target.parentElement.firstElementChild;
      const pid = tar.textContent;

      fetch('/api/review?mark=' + selectedRating + '&comment=' + comment.trim() + '&id=' + pid)
        .then(statusCheck)
        .then(response => response.json())
        .then(data => {
          showAlert(data.result);
        })
        .catch(error => {
          handleError("Failed to load project data: ", error);
        });

      id('review-comment').value = '';
      updateStars(0);
    } else {
      showAlert('please input mark and comment');
    }
  }

  /**
   * This function is for registering for new users
   */
  function DoregisterBtn() {
    id("review-section").classList.add('hidden');
    id("home").classList.add('hidden');
    id("search-bar").classList.add('hidden');
    id("user").classList.add('hidden');
    id("order").classList.add('hidden');
    id("error").classList.add('hidden');
    id("register-section").classList.remove('hidden');
    id("login-section").classList.add('hidden');
  }

  /**
   * This function is for doing the register.
   * @param {event} event - The event object triggered by the user interaction.
   */
  function DoregisterB(event) {
    event.preventDefault();
    const username = id('user-name').value;
    const password = id('pass-word').value;
    const childName = id('child-name').value;
    const email = id('email').value;
    const address2 = id('address-register').value;

    fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name: username, password: password,
        childName: childName, age: id('age').value, email: email, address: address2})
    })
      .then(statusCheck)
      .then(data => {
        if (data) {
          id("user").classList.add('hidden');
          id("order").classList.add('hidden');
          id("error").classList.add('hidden');
          id("login-section").classList.remove('hidden');
          id("register-section").classList.add('hidden');
          id("home").classList.add('hidden');
        }
      })
      .catch(error => {
        handleError("Failed to load project data: ", error);
      });
  }

  /**
   * This function is for uploading images.
   * @param {event} event - The event object triggered by the user interaction.
   */
  async function Doupload(event) {
    event.preventDefault();
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files.length) {
      showAlert('chose a file！');
      return;
    }
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const result = await response.json();
        showAlert(`upload successfully: ${result.fileName}`);
        id("file-id").textContent = result.fileName;
      } else {
        const error = await response.text();
        showAlert(`upload failed: ${error}`);
      }
    } catch (error) {
      showAlert(`failed：${error.message}`);
    }
  }

  /**
   * Sets up event listeners for various user interactions.
   */
  function setupEventListeners() {
    settingUp();
    document.getElementById('role').addEventListener('change', function() {
      adjustFontSizeForElders(this.value);
    });

    id('confirm-button').onclick = function() {
      document.getElementById('custom-alert').style.display = 'none';
    };

    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseFloat(star.getAttribute('data-value'));
        if (event.offsetX > star.offsetWidth / 2) {
          selectedRating = rating;
        } else {
          selectedRating = rating - HALF_STAR_VALUE;
        }
        updateStars(selectedRating);
      });
    });
    document.getElementById('review-submit-btn').addEventListener('click', reviewSubmit);
  }

  /**
   * Helper sets up event listeners for various user interactions.
   */
  function settingUp() {
    id("toggle-mode").addEventListener("click", modeClick);
    id("login").addEventListener("click", loginBtn);
    id("login-button").addEventListener("click", loginFormClick);
    id("head").addEventListener("click", headClick);
    id("search-btn").addEventListener("click", searchTable);
    id("degree-check-box").addEventListener("click", searchTable);
    id("order-btn").addEventListener("click", doOrder);
    id("unconfirm-btn").addEventListener('click', doUnconfirm);
    id("submit-btn").addEventListener('click', doTransaction);
    id("light-dark").addEventListener('click', toggleLightDark);
    id("logout-btn").addEventListener('click', DologoutBtn);
    id("order-history").addEventListener('click', DoOrderHistory);
    id("show-register-btn").addEventListener('click', DoregisterBtn);
    id("register-btn").addEventListener('click', DoregisterB);
    id("upload-form-btn").addEventListener("click", Doupload);
  }

  /**
   * This function is for doing the transactions.
   * @param {event} event - The event object triggered by the user interaction.
   */
  function doTransaction(event) {
    event.preventDefault();
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const address = document.getElementById('address').value;
    const filename = id('file-id').textContent;
    const parentId = sessionStorage.getItem('userId');
    const elderId = sessionStorage.getItem('elderId');

    fetch('/api/shelterOrder', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({startTime: startTime, endTime: endTime,
        elderId: elderId, parentId: parentId, address: address, filename: filename})
    })
      .then(statusCheck)
      .then(response => response.json())
      .then(data => {

        const num = data.result;
        id("confirm-num").textContent = 'Confirm Number: ' + num;
        id('confirm-num').classList.remove('hidden');
      })
      .catch(error => {
        showAlert(error);
      });
  }

  /**
   * This function is for doing the order.
   * @param {event} event - The event object triggered by the user interaction.
   */
  function doOrder(event) {
    event.preventDefault();
    id('start-time').disabled = true;
    id('end-time').disabled = true;
    id('address').disabled = true;
    id('file-input').disabled = true;
    id('order-div').classList.add('hidden');
    id('confirm-num').classList.add('hidden');
    id('submit-div').classList.remove('hidden');
  }

  /**
   * This function is for loging in.
   */
  function loginBtn() {
    id("review-section").classList.add('hidden');
    id("home").classList.add('hidden');
    id("search-bar").classList.add('hidden');
    id("user").classList.add('hidden');
    id("order").classList.add('hidden');
    id("error").classList.add('hidden');
    id("history-section").classList.add('hidden');
    id("register-section").classList.add('hidden');
    id("login-section").classList.remove('hidden');
  }

  /**
   * This function is for doing going back to the main view.
   */
  function headClick() {
    id("review-section").classList.add('hidden');
    id("user").classList.add('hidden');
    id("order").classList.add('hidden');
    id("error").classList.add('hidden');
    id("history-section").classList.add('hidden');
    id("login-section").classList.add('hidden');
    id("home").classList.remove('hidden');
    id("history-section").classList.add('hidden');
    id("register-section").classList.add('hidden');
    id("search-bar").classList.remove('hidden');
    fetchElders();
  }

  /**
   * This function is for doing login.
   * @param {event} event - The event object triggered by the user interaction.
   */
  function loginFormClick(event) {
    event.preventDefault();
    const username = id('username').value;

    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name: username, password: id('password').value, role: id('role').value})
    })
      .then(statusCheck)
      .then(response => response.json())
      .then(data => {
        if (data) {
          id("user").classList.add('hidden');
          id("order").classList.add('hidden');
          id("error").classList.add('hidden');
          id("login-section").classList.add('hidden');
          id("history-section").classList.add('hidden');
          id("register-section").classList.add('hidden');
          id("home").classList.remove('hidden');
          id("login").src = "img/" + data.name.replace(/\s+/g, '-').toLowerCase() + '.png';
          sessionStorage.setItem('username', username);
          sessionStorage.setItem('userId', data.id);
        }
      })
      .catch(error => {
        showAlert(error);
      });
  }

  /**
   * This function is for toggling between light and dark.
   */
  function toggleLightDark() {
    if (document.body.classList.contains('light-mode')) {
      document.body.classList.remove('light-mode');
      document.body.classList.add('night-mode');
      localStorage.setItem('theme', 'dark-mode');
    } else {
      document.body.classList.remove('night-mode');
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light-mode');
    }
  }
})();