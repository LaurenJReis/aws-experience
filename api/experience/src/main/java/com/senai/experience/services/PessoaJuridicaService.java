package com.senai.experience.services;

import com.senai.experience.entities.PessoaJuridica;
import com.senai.experience.repositories.PessoaJuridicaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;



@Service
public class PessoaJuridicaService {

    private final PessoaJuridicaRepository repository;
    private final PasswordEncoder passwordEncoder;

    public PessoaJuridicaService(PessoaJuridicaRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<PessoaJuridica> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public PessoaJuridica findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public PessoaJuridica save(PessoaJuridica pessoaJuridica) {
        // Encoda a senha — vem como texto puro do request
        pessoaJuridica.setSenhaHash(passwordEncoder.encode(pessoaJuridica.getSenhaHash()));
        return repository.save(pessoaJuridica);
    }

    public PessoaJuridica update(PessoaJuridica pessoaJuridica) {
        if (pessoaJuridica.getId() == null || !repository.existsById(pessoaJuridica.getId())) {
            return null;
        }
        // Encoda a nova senha — o campo vem como texto puro do request
        pessoaJuridica.setSenhaHash(passwordEncoder.encode(pessoaJuridica.getSenhaHash()));
        return repository.save(pessoaJuridica);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
