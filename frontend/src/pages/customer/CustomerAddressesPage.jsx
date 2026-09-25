import { useEffect, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../../api/userApi';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const initialAddressState = {
  name: '',
  phone: '',
  province: '',
  district: '',
  commune: '',
  address: '',
  postal_code: '',
  is_default: false,
};

const CustomerAddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialAddressState);

  const loadData = () => {
    getAddresses()
      .then((data) => setAddresses(data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialAddressState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr.id);
    setFormData({ ...addr });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    await deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateAddress(editingId, formData);
    } else {
      await createAddress(formData);
    }
    setIsModalOpen(false);
    loadData();
  };

  if (loading) {
    return <Loading message="Loading saved addresses..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Delivery Addresses</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your shipping destinations for fast checkout</p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          <span>Add New Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No Delivery Addresses Saved"
          description="Add a shipping address to enjoy seamless checkout on future orders."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 bg-white border rounded-xl shadow-xs flex flex-col justify-between transition ${
                addr.is_default ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-slate-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{addr.name}</span>
                  {addr.is_default && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase">
                      <CheckCircle2 size={11} />
                      <span>Default</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium">{addr.phone}</p>

                <p className="text-xs text-slate-500 leading-relaxed pt-1">
                  {addr.address}, {addr.commune}, {addr.district}, {addr.province} {addr.postal_code}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(addr)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-blue-600 rounded hover:bg-slate-50 transition cursor-pointer"
                >
                  <Pencil size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-red-600 rounded hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-lg border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Delivery Address' : 'Add Delivery Address'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <div>
    <label className="block font-semibold text-slate-700 mb-1">
      Contact Name
    </label>
    <input
      type="text"
      placeholder="e.g. Athiphou Thy"
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      required
      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
    />
  </div>

  <div>
    <label className="block font-semibold text-slate-700 mb-1">
      Phone Number
    </label>
    <input
      type="text"
      placeholder="+855 ..."
      value={formData.phone}
      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      required
      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
    />
  </div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <div>
    <label className="block font-semibold text-slate-700 mb-1">
      Province / City
    </label>
    <input
      type="text"
      placeholder="Phnom Penh"
      value={formData.province}
      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
      required
      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
    />
  </div>

  <div>
    <label className="block font-semibold text-slate-700 mb-1">
      Khan / District
    </label>
    <input
      type="text"
      placeholder="Sen Sok"
      value={formData.district}
      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
      required
      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
    />
  </div>
</div>

<div>
  <label className="block font-semibold text-slate-700 mb-1">
    Street, House No., Sangkat
  </label>
  <input
    type="text"
    placeholder="AH11, Tuek Thla, Sen Sok, Phnom Penh"
    value={
      formData.address && formData.commune
        ? `${formData.address}, ${formData.commune}`
        : formData.address
    }
    onChange={(e) => {
      const value = e.target.value;

      setFormData({
        ...formData,
        address: value,
      });
    }}
    required
    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
  />
</div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address / House Number</label>
                <input
                  type="text"
                  placeholder="Street 63, Building #12"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Postal Code (Optional)</label>
                <input
                  type="text"
                  placeholder="12000"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_default" className="text-slate-700 font-medium cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAddressesPage;
