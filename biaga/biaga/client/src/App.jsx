import axios from "axios";
import {useEffect, useState} from "react";

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [age, setAge] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/students")
      .then((response) => {
        setStudents(response.data);
      })
      .catch(() => {
        setMessage("Unable to load students. Check the server and MongoDB connection.");
      });
  }, []);

  async function loadStudents() {
    const response = await axios.get("http://localhost:5000/students");
    setStudents(response.data);
  }

  function clearForm() {
    setName("");
    setCourse("");
    setAge("");
    setEditingId(null);
  }

  async function saveStudent(event) {
    event.preventDefault();
    if (saving) return;
    if (!name.trim() || !course.trim() || age === "" || !Number.isInteger(Number(age)) || Number(age) < 1) {
      setMessage("Enter a name, course, and a valid whole-number age.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const student = {name: name.trim(), course: course.trim(), age: Number(age)};
      if (editingId) {
        await axios.put("http://localhost:5000/students/" + editingId, student);
      } else {
        await axios.post("http://localhost:5000/students", student);
      }
      const successMessage = editingId ? "Student updated successfully." : "Student added successfully.";
      clearForm();
      try {
        await loadStudents();
        setMessage(successMessage);
      } catch {
        setMessage(successMessage + " Refresh to reload the student list.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save student. Check the server and MongoDB connection.");
    } finally {
      setSaving(false);
    }
  }

  function editStudent(student) {
    setEditingId(student._id);
    setName(student.name);
    setCourse(student.course);
    setAge(student.age);
    setMessage("");
  }

  async function deleteStudent(id) {
    if (saving) return;
    setSaving(true);
    setMessage("");
    try {
      await axios.delete("http://localhost:5000/students/" + id);
      if (editingId === id) clearForm();
      try {
        await loadStudents();
        setMessage("Student deleted successfully.");
      } catch {
        setMessage("Student deleted successfully. Refresh to reload the student list.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete student. Check the server and MongoDB connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <style>{`
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}
`}</style>
      <h1>Student Management System</h1>
      <form onSubmit={saveStudent}>
        <p><label>Name: <input value={name} onChange={(event) => setName(event.target.value)} required disabled={saving} /></label></p>
        <p><label>Course: <input value={course} onChange={(event) => setCourse(event.target.value)} required disabled={saving} /></label></p>
        <p><label>Age: <input type="number" min="1" step="1" value={age} onChange={(event) => setAge(event.target.value)} required disabled={saving} /></label></p>
        <button type="submit" disabled={saving}>{editingId ? "Update Student" : "Add Student"}</button>
        {editingId && <button type="button" onClick={clearForm} disabled={saving}>Cancel</button>}
      </form>
      <p role="status">{message}</p>
      <p>Students</p>
      {students.map((student) => (
        <div key={student._id}>
          <p>Name: {student.name}</p>
          <p>Course: {student.course}</p>
          <p>Age: {student.age}</p>
          <button onClick={() => editStudent(student)} disabled={saving}>Edit</button>
          <button onClick={() => deleteStudent(student._id)} disabled={saving}>Delete</button>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;
