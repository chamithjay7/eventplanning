package com.pg113.eventplanning.features.tasks.service;

import com.pg113.eventplanning.features.events.model.Event;
import com.pg113.eventplanning.features.events.repository.EventRepository;
import com.pg113.eventplanning.features.tasks.model.Task;
import com.pg113.eventplanning.features.tasks.model.TaskStatus;
import com.pg113.eventplanning.features.tasks.repository.TaskRepository;
import com.pg113.eventplanning.features.users.model.User;
import com.pg113.eventplanning.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepo;
    private final EventRepository eventRepo;
    private final UserRepository userRepo;

    private Event getEventOrThrow(Long id) {
        return eventRepo.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    }
    private User getUserOrThrow(Long id) {
        return userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }
    private Task getTaskOrThrow(Long id) {
        return taskRepo.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
    }

    // Only the event organizer can create/assign/update/delete tasks for that event
    private void ensureOrganizer(Event e, String actorUsername) {
        if (!e.getOrganizer().getUsername().equals(actorUsername)) {
            throw new RuntimeException("Only the organizer can manage tasks for this event");
        }
    }

    @Transactional
    public Task create(Task t, String actorUsername) {
        Event e = getEventOrThrow(t.getEvent().getId());
        ensureOrganizer(e, actorUsername);
        t.setEvent(e);
        if (t.getAssignedTo() != null && t.getAssignedTo().getId() != null) {
            t.setAssignedTo(getUserOrThrow(t.getAssignedTo().getId()));
        }
        if (t.getStatus() == null) t.setStatus(TaskStatus.TODO);
        return taskRepo.save(t);
    }

    public List<Task> listByEvent(Long eventId, String actorUsername) {
        Event e = getEventOrThrow(eventId);
        ensureOrganizer(e, actorUsername);
        return taskRepo.findByEvent(e);
    }

    public List<Task> listMyTasks(String username) {
        User u = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return taskRepo.findByAssignedTo(u);
    }

    public List<Task> findAll() {
        return taskRepo.findAll();
    }

    public List<Task> search(String q) {
        return taskRepo.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(q, q);
    }

    @Transactional
    public Task update(Long taskId, String actorUsername, String title, String desc, Instant due, TaskStatus status, Long assigneeId) {
        Task t = getTaskOrThrow(taskId);
        ensureOrganizer(t.getEvent(), actorUsername);
        if (title != null) t.setTitle(title);
        if (desc != null) t.setDescription(desc);
        if (due != null) t.setDueDate(due);
        if (status != null) t.setStatus(status);
        if (assigneeId != null) t.setAssignedTo(getUserOrThrow(assigneeId));
        return t;
    }

    @Transactional
    public Task updateStatusAsAssignee(Long taskId, String actorUsername, TaskStatus status) {
        Task t = getTaskOrThrow(taskId);
        if (t.getAssignedTo() == null || !t.getAssignedTo().getUsername().equals(actorUsername)) {
            throw new RuntimeException("Only the assignee can update this task status");
        }
        t.setStatus(status);
        return t;
    }

    public void delete(Long taskId, String actorUsername) {
        Task t = getTaskOrThrow(taskId);
        ensureOrganizer(t.getEvent(), actorUsername);
        taskRepo.delete(t);
    }
}
