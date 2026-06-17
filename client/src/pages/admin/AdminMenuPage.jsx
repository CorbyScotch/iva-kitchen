import { useState, useEffect } from "react";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../services/menuService";
import { Plus, Pencil, Trash2, X, Upload, Loader2 } from "lucide-react";
import { uploadImage } from "../../services/uploadService";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Local Dishes",
  "Grills",
  "Fast Food",
  "Drinks",
  "Desserts",
  "Sides",
];

// ─── Menu Item Form (used for both Add and Edit) ─────────
const MenuItemForm = ({ initial, onSave, onCancel }) => {
  const [formData, setFormData] = useState(
    initial
      ? { ...initial }
      : {
          name: "",
          description: "",
          // Start with one empty option row by default
          options: [{ label: "", price: "" }],
          category: "Local Dishes",
          image: "",
          isAvailable: true,
          isFeatured: false,
        },
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // cloudinary

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // ── Handle changes inside a specific option row ──
  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setFormData({ ...formData, options: updatedOptions });
  };

  // ── Add a new empty option row ──
  const addOptionRow = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { label: "", price: "" }],
    });
  };

  // ── Remove an option row ──
  const removeOptionRow = (index) => {
    // Don't allow removing the last remaining option — every item needs at least one
    if (formData.options.length === 1) {
      toast.error("At least one price option is required");
      return;
    }
    const updatedOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: updatedOptions });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; // grabs the selected file
    if (!file) return;

    // Basic size check — reject anything over 5MB before even trying to upload
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    try {
      setUploading(true);
      const { data } = await uploadImage(file);
      // Save the returned Cloudinary URL into our form state
      setFormData({ ...formData, image: data.imageUrl });
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate every option has a price (label can be empty for single-price items)
    const hasEmptyPrice = formData.options.some(
      (opt) => opt.price === "" || opt.price === null,
    );
    if (hasEmptyPrice) {
      toast.error("Please fill in a price for every option");
      return;
    }

    // Convert prices to numbers before sending (inputs give strings)
    const cleanedData = {
      ...formData,
      options: formData.options.map((opt) => ({
        label: opt.label.trim() || "Regular", // default label if left blank
        price: Number(opt.price),
      })),
    };

    try {
      setSaving(true);
      await onSave(cleanedData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Jollof Rice"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Image URL */}
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Food Photo
        </label>

        {/* Show preview if an image already exists */}
        {formData.image && (
          <div className="mb-3 relative w-32 h-32">
            <img
              src={formData.image}
              alt="Preview"
              className="w-full h-full object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, image: "" })}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* File picker */}
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-4 cursor-pointer hover:border-orange-400 transition-colors">
          {uploading ? (
            <>
              <Loader2 size={18} className="text-orange-500 animate-spin" />
              <span className="text-sm text-gray-500">Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={18} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                {formData.image ? "Change photo" : "Click to upload a photo"}
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden" // we hide the ugly default file input and style our own
          />
        </label>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the dish..."
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none"
        />
      </div>

      {/* ── Price Options ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Price Options *
          </label>
          <button
            type="button"
            onClick={addOptionRow}
            className="flex items-center gap-1 text-orange-500 text-xs font-semibold hover:underline"
          >
            <Plus size={14} /> Add Size
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-3">
          Leave label blank if the item has only one fixed price.
        </p>

        <div className="space-y-2">
          {formData.options.map((opt, index) => (
            <div key={index} className="flex items-center gap-2">
              {/* Label input */}
              <input
                type="text"
                placeholder="e.g. Small, Regular, Jumbo (optional)"
                value={opt.label}
                onChange={(e) =>
                  handleOptionChange(index, "label", e.target.value)
                }
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
              {/* Price input */}
              <input
                type="number"
                placeholder="Price"
                value={opt.price}
                onChange={(e) =>
                  handleOptionChange(index, "price", e.target.value)
                }
                min="0"
                className="w-24 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeOptionRow(index)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleChange}
            className="w-4 h-4 accent-orange-500"
          />
          <span className="text-sm text-gray-700">Available</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="w-4 h-4 accent-orange-500"
          />
          <span className="text-sm text-gray-700">Featured on homepage</span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-orange-500 text-white py-2.5 rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 text-sm"
        >
          {saving ? "Saving..." : "Save Item"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-full font-semibold hover:bg-gray-50 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// just update the item row display to show price range instead of single price:

// ─── Main Admin Menu Page ────────────────────────────────
const AdminMenuPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await getMenuItems();
      setItems(data);
    } catch (err) {
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const { data } = await createMenuItem(formData);
      setItems([data, ...items]);
      setShowForm(false);
      toast.success("Item added!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create item");
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const { data } = await updateMenuItem(editingItem._id, formData);
      // Replace the old item in the list with the updated one
      setItems(items.map((i) => (i._id === data._id ? data : i)));
      setEditingItem(null);
      toast.success("Item updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update item");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await deleteMenuItem(id);
      setItems(items.filter((i) => i._id !== id));
      toast.success("Item deleted");
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Menu Management
            </h1>
            <p className="text-gray-500 mt-1">
              {items.length} item{items.length !== 1 ? "s" : ""} on the menu
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingItem(null);
            }}
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-orange-600 transition-colors text-sm"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>

        {/* ── Add form ── */}
        {showForm && !editingItem && (
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">New Menu Item</h2>
              <button onClick={() => setShowForm(false)}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <MenuItemForm
              onSave={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* ── Items list ── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-24 bg-gray-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <p className="text-gray-400">
              No menu items yet. Add your first dish!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id}>
                {/* ── Edit form inline ── */}
                {editingItem?._id === item._id ? (
                  <div className="bg-white rounded-3xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-gray-900">Edit Item</h2>
                      <button onClick={() => setEditingItem(null)}>
                        <X
                          size={20}
                          className="text-gray-400 hover:text-gray-600"
                        />
                      </button>
                    </div>
                    <MenuItemForm
                      initial={editingItem}
                      onSave={handleUpdate}
                      onCancel={() => setEditingItem(null)}
                    />
                  </div>
                ) : (
                  /* ── Item row ── */
                  <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
                    {/* Image/emoji */}
                    <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        "🍽️"
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800 truncate">
                          {item.name}
                        </p>
                        {item.isFeatured && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                        {!item.isAvailable && (
                          <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {item.category} ·{" "}
                        {item.options.length === 1
                          ? `GH₵ ${item.options[0].price}`
                          : `GH₵ ${Math.min(...item.options.map((o) => o.price))} - ${Math.max(...item.options.map((o) => o.price))}`}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowForm(false);
                        }}
                        className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMenuPage;
