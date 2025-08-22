import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Student {
  id: number;
  index_number: string;
  surname: string;
  other_names: string;
  gender: string;
  programme_id: number;
  class_id: number;
}

export function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [programme, setProgramme] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchStudents();
  }, [search, programme, gender, page]);

  const fetchStudents = async () => {
    setLoading(true);

    let query = supabase.from("students_view").select("*", { count: "exact" });

    // search
    if (search) {
      query = query.ilike("surname", `%${search}%`)
                   .or(`other_names.ilike.%${search}%,index_number.ilike.%${search}%`);
    }

    // filters
    if (programme) query = query.eq("programme_id", programme);
    if (gender) query = query.eq("gender", gender);

    // pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await query.range(from, to);

    if (!error && data) setStudents(data);
    setLoading(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Student List</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Input
            placeholder="Search by name or index..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />

          <Select onValueChange={setProgramme}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Programme" />
            </SelectTrigger>
            <SelectContent>
              {/* TODO: Map programme list from DB */}
              <SelectItem value="1">General Science</SelectItem>
              <SelectItem value="2">Business</SelectItem>
              <SelectItem value="3">Arts</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setGender}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Male</SelectItem>
              <SelectItem value="F">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Index No.</th>
                <th className="p-2">Name</th>
                <th className="p-2">Gender</th>
                <th className="p-2">Programme</th>
                <th className="p-2">Class</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.index_number}</td>
                  <td className="p-2">{s.surname} {s.other_names}</td>
                  <td className="p-2">{s.gender}</td>
                  <td className="p-2">{s.programme_id}</td>
                  <td className="p-2">{s.class_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span>Page {page}</span>
          <Button onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
