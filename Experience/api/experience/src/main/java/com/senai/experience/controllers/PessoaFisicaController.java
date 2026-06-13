package com.senai.experience.controllers;

import com.senai.experience.DTO.request.PessoaFisicaRequest;
import com.senai.experience.DTO.response.PessoaFisicaResponse;
import com.senai.experience.entities.PessoaFisica;
import com.senai.experience.mappers.PessoaFisicaMapper;
import com.senai.experience.services.PessoaFisicaService;

import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/pessoaFisica")
public class PessoaFisicaController {

    private final PessoaFisicaService service;

    public PessoaFisicaController(PessoaFisicaService service) {
        this.service = service;
    }

    @GetMapping
    public Page<PessoaFisica> getAll(Pageable pageable) {
        return service.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PessoaFisica> getById(@PathVariable Long id) {
        PessoaFisica pessoaFisica = service.findById(id);
        if (pessoaFisica != null) {
            return ResponseEntity.ok(pessoaFisica);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Cadastro público de PessoaFisica.
     * O role padrão é CLIENTE — qualquer outro role enviado no body é ignorado.
     * A validação do CPF é feita automaticamente pelo @Valid + @CPF do Hibernate Validator.
     */
    @PostMapping
    public ResponseEntity<PessoaFisicaResponse> create(@Valid @RequestBody PessoaFisicaRequest request) {
        PessoaFisica pessoaFisica = PessoaFisicaMapper.toEntity(request);
        PessoaFisica salvo = service.save(pessoaFisica);
        return ResponseEntity.status(HttpStatus.CREATED).body(PessoaFisicaMapper.toResponse(salvo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<PessoaFisica> update(@PathVariable Long id, @Valid @RequestBody PessoaFisica pessoaFisica) {
        PessoaFisica existingPessoaFisica = service.findById(id);
        if (existingPessoaFisica != null) {
            pessoaFisica.setId(id);
            return ResponseEntity.ok(service.save(pessoaFisica));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}