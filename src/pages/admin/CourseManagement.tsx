export default function CourseManagement() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Course & Class Management</h2>
      <div className="space-y-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium">Create Course</h3>
          <p className="text-sm text-gray-500">Set up subjects and academic calendar.</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium">Assign Teachers</h3>
          <p className="text-sm text-gray-500">Link teachers to subjects and classes.</p>
        </div>
      </div>
    </div>
  );
}
