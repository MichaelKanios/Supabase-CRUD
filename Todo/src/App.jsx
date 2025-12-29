import { useEffect, useState } from "react";
import supabase from "./supabase-client";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------- FETCH ----------
  const fetchTodos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("TodoList")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
    } else {
      setTodos(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // ---------- ADD ----------
  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const { error } = await supabase.from("TodoList").insert([
      { name: newTodo, isCompleted: false },
    ]);

    if (error) {
      console.error("Insert error:", error);
      return;
    }

    setNewTodo("");
    fetchTodos(); // ✅ source of truth
  };

  // ---------- TOGGLE ----------
  const toggleTodo = async (id, isCompleted) => {
    const { error } = await supabase
      .from("TodoList")
      .update({ isCompleted: !isCompleted })
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      return;
    }

    fetchTodos();
  };

  // ---------- DELETE ----------
  const deleteTodo = async (id) => {
    const { error } = await supabase
      .from("TodoList")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return;
    }

    fetchTodos();
  };

  // ---------- UI ----------
  return (
    <div className="app">
      <h1>To Do List</h1>

      <div className="add">
        <input
          type="text"
          placeholder="Add a new task"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button onClick={addTodo}>Add</button>
      </div>

      {loading && <p>Loading...</p>}

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span
              style={{
                textDecoration: todo.isCompleted ? "line-through" : "none",
              }}
            >
              {todo.name}
            </span>

            <button onClick={() => toggleTodo(todo.id, todo.isCompleted)}>
              {todo.isCompleted ? "Undo" : "Complete"}
            </button>

            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
