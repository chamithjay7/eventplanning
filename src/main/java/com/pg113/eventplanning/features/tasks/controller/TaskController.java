package com.pg113.eventplanning.features.tasks.controller;

import com.pg113.eventplanning.features.events.model.Event;
import com.pg113.eventplanning.features.tasks.dto.TaskRequest;
import com.pg113.eventplanning.features.tasks.dto.TaskResponse;
import com.pg113.eventplanning.features.tasks.dto.UpdateStatusRequest;
import com.pg113.eventplanning.features.tasks.dto.UpdateTaskRequest;
import com.pg113.eventplanning.features.tasks.model.Task;
import com.pg113.eventplanning.features.tasks.service.TaskService;
import com.pg113.eventplanning.features.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // Create (organizer of the event)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(@RequestBody @jakarta.validation.Valid TaskRequest req, Authentication auth) {
        Task t = Task.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .dueDate(req.getDueDate())
                .event(Event.builder().id(req.getEventId()).build())
                .assignedTo(req.getAssignedToUserId() != null ? User.builder().id(req.getAssignedToUserId()).build() : null)
                .build();
        return toResponse(taskService.create(t, auth.getName()));
    }

    // List tasks of an event (organizer)
    @GetMapping("/event/{eventId}")
    public List<TaskResponse> listByEvent(@PathVariable Long eventId, Authentication auth) {
        return taskService.listByEvent(eventId, auth.getName()).stream().map(this::toResponse).toList();
    }

    // My tasks (assignee)
    @GetMapping("/mine")
    public List<TaskResponse> myTasks(Authentication auth) {
        return taskService.listMyTasks(auth.getName()).stream().map(this::toResponse).toList();
    }

    // All tasks (ADMIN only)
    @GetMapping("/all")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public List<TaskResponse> getAllTasks() {
        return taskService.findAll().stream().map(this::toResponse).toList();
    }

    // Search tasks (simple global search)
    @GetMapping("/search")
    public List<TaskResponse> search(@RequestParam String q) {
        return taskService.search(q).stream().map(this::toResponse).toList();
    }

    // Update (organizer)
    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable Long id,
                               @RequestBody UpdateTaskRequest req,
                               Authentication auth) {
        var updated = taskService.update(
                id, auth.getName(),
                req.getTitle(), req.getDescription(), req.getDueDate(), req.getStatus(), req.getAssignedToUserId()
        );
        return toResponse(updated);
    }

    // Assignee updates only status
    @PatchMapping("/{id}/status")
    public TaskResponse updateStatus(@PathVariable Long id,
                                     @RequestBody @jakarta.validation.Valid UpdateStatusRequest req,
                                     Authentication auth) {
        return toResponse(taskService.updateStatusAsAssignee(id, auth.getName(), req.getStatus()));
    }

    // Delete (organizer)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        taskService.delete(id, auth.getName());
    }

    // --- mapper ---
    private TaskResponse toResponse(Task t) {
        return TaskResponse.builder()
                .id(t.getId())
                .eventId(t.getEvent() != null ? t.getEvent().getId() : null)
                .assignedToUserId(t.getAssignedTo() != null ? t.getAssignedTo().getId() : null)
                .assignedToUsername(t.getAssignedTo() != null ? t.getAssignedTo().getUsername() : null)
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus())
                .dueDate(t.getDueDate())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
