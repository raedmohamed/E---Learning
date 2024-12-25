const form = document.forms[0];
const courseName = document.forms[0].querySelector("#courseName");
const courseDescription = document.forms[0].querySelector("#courseDescription");
const formBtn = document.forms[0].querySelector("button");
const courseContainer = document.getElementsByClassName("course-grid")[0];

let arrayList = [];
let objectToEdit = {};

async function getData() {
  try {
    const response = await fetch(
      "https://fakerestapi.azurewebsites.net/api/v1/Books"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    arrayList = data;
    displayCourses(data);
    console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
async function addCourse() {
  try {
    const response = await fetch(
      "https://fakerestapi.azurewebsites.net/api/v1/Books",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          title: courseName.value,
          description: courseDescription.value,
          id: arrayList[arrayList.length - 1]?.id + 1 || 1, // Handle empty array case
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    arrayList.push(data);
    console.log(data);
    new Course(data.id, data.title, data.description).createCourse(
      courseContainer
    );
    courseName.value = "";
    courseDescription.value = "";
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("An error occurred while submitting the form.");
  }
}

async function editCourse() {
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      description: objectToEdit.description,
      excerpt: objectToEdit.excerpt,
      id: objectToEdit.id,
      pageCount: objectToEdit.pageCount,
      publishDate: objectToEdit.publishDate,
      title: objectToEdit.title,
    }),
  };

  try {
    const response = await fetch(
      `https://fakerestapi.azurewebsites.net/api/v1/Books/${objectToEdit.id}`,
      options
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Data successfully updated:", data);
    arrayList[objectToEdit.id - 1].title = courseName.value;
    arrayList[objectToEdit.id - 1].description = courseDescription.value;
    const courseCard = courseContainer.children[objectToEdit.id - 1];
    const courseTitle = courseCard.querySelector("h3");
    const courseDescriptionText = courseCard.querySelector("p");
    courseTitle.textContent = objectToEdit.title;
    courseDescriptionText.textContent = objectToEdit.description;
    courseName.value = null;
    courseDescription.value = null;
    formBtn.textContent = "Add Course";
    objectToEdit = {};
    // return data;
  } catch (error) {
    console.error("Failed to update data:", error);
    throw error;
  }
}
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (formBtn.textContent === "Add Course") {
    await addCourse(); // Call the function
  }

  if (formBtn.textContent === "Update Course") {
    objectToEdit.title = courseName.value;
    objectToEdit.description = courseDescription.value;

    await editCourse();
  }
});

getData();

function displayCourses(coursesList) {
  coursesList.forEach((element) => {
    new Course(element.id, element.title, element.description).createCourse(
      courseContainer
    );
  });
}

class Course {
  constructor(id, title, description) {
    this.id = id;
    this.title = title;
    this.description = description;
  }

  createCourse(coursesParent) {
    const courseCard = document.createElement("div");
    courseCard.classList.add("course-card");

    const courseImg = document.createElement("img");
    courseImg.src = "images/c1.jpg";
    courseCard.appendChild(courseImg);

    const courseInfo = document.createElement("div");
    courseInfo.classList.add("course-info");

    const courseTitle = document.createElement("h3");
    courseTitle.textContent = this.title;
    courseInfo.appendChild(courseTitle);

    const courseDescription = document.createElement("p");
    courseDescription.textContent = this.description;
    courseInfo.appendChild(courseDescription);

    const courseDetailsBtn = document.createElement("button");
    courseDetailsBtn.textContent = "Show Details";
    courseDetailsBtn.classList.add("btn-primary");
    courseInfo.appendChild(courseDetailsBtn);

    const courseDeleteBtn = document.createElement("button");
    courseDeleteBtn.textContent = "Delete";
    courseDeleteBtn.classList.add("btn-primary", "bg-danger");
    courseInfo.appendChild(courseDeleteBtn);

    const courseEditBtn = document.createElement("button");
    courseEditBtn.textContent = "Edit";
    courseEditBtn.classList.add("btn-primary", "bg-green");
    courseInfo.appendChild(courseEditBtn);

    courseCard.appendChild(courseInfo);
    coursesParent.appendChild(courseCard);
  }
}

courseContainer.addEventListener("click", function (event) {
  if (event.target && event.target.textContent === "Delete") {
    const courseCard = event.target.closest(".course-card");
    if (courseCard) {
      const courseIndex = Array.from(courseContainer.children).indexOf(
        courseCard
      );
      if (courseIndex !== -1) {
        objectToEdit = arrayList[courseIndex];
        deleteCourse(objectToEdit.id);
        arrayList.splice(courseIndex, 1);
        courseCard.remove();
      }
    }
  }
  if (event.target && event.target.textContent === "Edit") {
    const courseCard = event.target.closest(".course-card");
    if (courseCard) {
      const courseIndex = Array.from(courseContainer.children).indexOf(
        courseCard
      );
      if (courseIndex !== -1) {
        objectToEdit = arrayList[courseIndex];
        courseName.value = objectToEdit.title;
        courseDescription.value = objectToEdit.description;
        formBtn.textContent = "Update Course";
      }
    }
  }
});

async function deleteCourse(id) {
  try {
    const response = await fetch(
      `https://fakerestapi.azurewebsites.net/api/v1/Books/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log(`Course with ID: ${id} deleted.`);
  } catch (error) {
    console.error("Error deleting course:", error);
  }
}
