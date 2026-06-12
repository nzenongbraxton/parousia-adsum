import { Head, useForm } from "@inertiajs/react";
import { Plus, Search, MoreHorizontal, Loader2 } from "lucide-react";
import { AdminLayout } from "@/Components/ParousiaAdsum/AdminLayout";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { useState, FormEventHandler } from "react";

interface StaffMember {
  id: number;
  name: string;
  initials: string;
  email: string;
  role: string;
}

interface Props {
  staff: StaffMember[];
  currentUserRole: string;
}

export default function StaffPage({ staff, currentUserRole }: Props) {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    password: "",
    role: "Staff",
  });

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.email.toLowerCase().includes(query.toLowerCase()),
  );

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route("admin.staff.store"), {
      onSuccess: () => closeModal(),
    });
  };

  const allowedRoles = [];
  if (currentUserRole === "SuperAdmin") {
    allowedRoles.push("Admin", "Staff");
  } else if (currentUserRole === "Admin") {
    allowedRoles.push("Staff");
  }

  return (
    <AdminLayout
      title="Staff Management"
      subtitle="Manage employees, roles and access policies."
    >
      <Head title="Staff Management — ParousiaAdsum" />

      <div className="glass-strong rounded-2xl p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {allowedRoles.length > 0 && (
            <Button
              onClick={openModal}
              className="gap-1.5 bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add staff
            </Button>
          )}
        </div>

        <ul className="mt-4 divide-y rounded-xl border bg-card/40">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">
              No staff found.
            </li>
          ) : (
            filtered.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 px-3 py-3 md:px-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  {s.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.email} &middot; {s.role}
                  </p>
                </div>
                <button
                  aria-label="More"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <Modal show={isModalOpen} onClose={closeModal}>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">
            Create New Staff Member
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Add a new user to your organization. They will be able to log in with the email and password you set.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-6">
            <div>
              <InputLabel htmlFor="name" value="Name" />
              <TextInput
                id="name"
                className="mt-1 block w-full"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                required
                autoFocus
              />
              <InputError className="mt-2" message={errors.name} />
            </div>

            <div>
              <InputLabel htmlFor="email" value="Email Address" />
              <TextInput
                id="email"
                type="email"
                className="mt-1 block w-full"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                required
              />
              <InputError className="mt-2" message={errors.email} />
            </div>

            <div>
              <InputLabel htmlFor="password" value="Initial Password" />
              <TextInput
                id="password"
                type="password"
                className="mt-1 block w-full"
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
                required
              />
              <InputError className="mt-2" message={errors.password} />
            </div>

            <div>
              <InputLabel htmlFor="role" value="Role" />
              <select
                id="role"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={data.role}
                onChange={(e) => setData("role", e.target.value)}
                required
              >
                {allowedRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <InputError className="mt-2" message={errors.role} />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <SecondaryButton onClick={closeModal} disabled={processing}>
                Cancel
              </SecondaryButton>
              <PrimaryButton className="gap-2" disabled={processing}>
                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                Create User
              </PrimaryButton>
            </div>
          </form>
        </div>
      </Modal>
    </AdminLayout>
  );
}
