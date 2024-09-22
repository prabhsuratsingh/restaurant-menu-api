"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

async function deleteMenu(id) {
  const res = await fetch(`http://127.0.0.1:3000/api/menu/${id}/`, {
    method: "DELETE",
  });

  if(!res.ok) {
    throw new Error("Failed to retrieve menu!");
  }

  return Promise.resolve(); 
}

async function getData() {
  const res = await fetch("http://127.0.0.1:3000/api/menu/");
  if(!res.ok) {
    throw new Error("Failed to fetch data!");
  }

  return res.json();
}


const MenuItem = ({ id, name, price, onEdit, onDelete }) => {
  return (
    <div className="menu-item" data-id={id}>
      <div className="menu-item-info">
        <div className="menu-item-name">{name}</div>
        <div className="menu-item-price">${price.toFixed(2)}</div>
      </div>
      <div className="menu-item-actions">
        <button className="edit-button" onClick={onEdit}>
          Edit
        </button>
        <button 
          className="delete-button"
          onClick={() => {
            deleteMenu(id).then(() => onDelete(id));
          }}>
          Delete
        </button>
      </div>
    </div>
  );
}


export default function Page() {
  const [menuItems, setMenuItems] = useState(null);
  const router = useRouter();
  const params = useSearchParams();

  //state for displaying success message
  const [displaySuccessMessage, setDisplaySuccessMessage] = useState({
    show: false,
    type: "",
  });

  //fetch menu items on component mount
  useEffect(() => {
    const fetchData = async () => {
      const data = await getData();
      setMenuItems(data);
    };
    fetchData().catch(console.error);
  }, []);

  //detect changes url params for success message
  useEffect(() => {
    if(!!params.get("action")) {
      setDisplaySuccessMessage({
        type: params.get("action"),
        show: true,
      });
      router.replace("/");
    }
  }, [params, router]);

  //automatically hide the success message after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if(displaySuccessMessage.show) {
        setDisplaySuccessMessage({ show:false, type:""});
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [displaySuccessMessage.show]);

  //handle deletion of menu items
  const handleDelete = (id) => {
    setMenuItems((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div>
      <button className="add-button" onClick={() => router.push("/add")}>
        Add
      </button>
      {displaySuccessMessage.show && (
        <p className="success-message">
          {displaySuccessMessage.type === "add" ? "Added a" : "Modified a"} menu item
        </p>
      )}
      {menuItems ? (
        menuItems.map((item) => (
          <MenuItem
            key={item.id}
            id={item.id}
            name={item.name}
            price={item.price}
            onEdit={() => router.push(`/update/${item.id}`)}
            onDelete={handleDelete}
          />
        ))
      ) : (
        <p>Loading....</p>
      )}
    </div>
  );
}
